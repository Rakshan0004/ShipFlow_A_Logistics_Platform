package com.zippy.backend.service;

import com.zippy.backend.dto.PaymentResponse;
import com.zippy.backend.exception.OrderNotFoundException;
import com.zippy.backend.model.Order;
import com.zippy.backend.model.Payment;
import com.zippy.backend.model.Shipment;
import com.zippy.backend.repository.OrderRepository;
import com.zippy.backend.repository.PaymentRepository;
import com.zippy.backend.repository.ShipmentRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;

@Service
public class PaymentService {

    // Deterministic shipping charge options seeded by order DB id
    private static final BigDecimal[] SHIPPING_OPTIONS = {
            new BigDecimal("49.00"),
            new BigDecimal("79.00"),
            new BigDecimal("99.00"),
            new BigDecimal("129.00")
    };

    // Deterministic prepaid order amounts seeded by order DB id
    private static final BigDecimal[] PREPAID_AMOUNTS = {
            new BigDecimal("299.00"),
            new BigDecimal("499.00"),
            new BigDecimal("799.00"),
            new BigDecimal("999.00"),
            new BigDecimal("1299.00"),
            new BigDecimal("1499.00"),
            new BigDecimal("1999.00"),
            new BigDecimal("2499.00")
    };

    private static final BigDecimal GST_RATE = new BigDecimal("0.18");

    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;
    private final ShipmentRepository shipmentRepository;

    public PaymentService(OrderRepository orderRepository,
                          PaymentRepository paymentRepository,
                          ShipmentRepository shipmentRepository) {
        this.orderRepository = orderRepository;
        this.paymentRepository = paymentRepository;
        this.shipmentRepository = shipmentRepository;
    }

    /**
     * Returns existing payment for the order, or generates + saves a new one.
     * This is idempotent — second call returns the persisted record.
     */
    @Transactional
    public PaymentResponse getOrCreatePayment(String zippyOrderId) {
        Order order = orderRepository.findByZippyOrderId(zippyOrderId)
                .orElseThrow(() -> new OrderNotFoundException(zippyOrderId));

        Payment payment = paymentRepository.findByOrder_ZippyOrderId(zippyOrderId)
                .orElseGet(() -> generateAndSavePayment(order));

        return toResponse(payment);
    }

    /**
     * Paginated list with optional status filters.
     * Auto-generates missing payment records for any orders that don't have one yet.
     */
    @Transactional
    public Page<PaymentResponse> getAllPayments(int page, int size, String paymentStatus, String settlementStatus) {
        // Ensure all orders have a payment record (bulk lazy generation)
        List<Order> allOrders = orderRepository.findAll();
        for (Order order : allOrders) {
            if (!paymentRepository.existsByOrder_Id(order.getId())) {
                generateAndSavePayment(order);
            }
        }

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Payment> payments;

        if (paymentStatus != null && !paymentStatus.isBlank() && settlementStatus != null && !settlementStatus.isBlank()) {
            payments = paymentRepository.findByPaymentStatusAndSettlementStatus(paymentStatus, settlementStatus, pageable);
        } else if (paymentStatus != null && !paymentStatus.isBlank()) {
            payments = paymentRepository.findByPaymentStatus(paymentStatus, pageable);
        } else if (settlementStatus != null && !settlementStatus.isBlank()) {
            payments = paymentRepository.findBySettlementStatus(settlementStatus, pageable);
        } else {
            payments = paymentRepository.findAll(pageable);
        }

        return payments.map(this::toResponse);
    }

    // ─── Mock Generation ────────────────────────────────────────────────────────

    private Payment generateAndSavePayment(Order order) {
        Optional<Shipment> shipmentOpt = shipmentRepository.findByOrder_ZippyOrderId(order.getZippyOrderId());

        Payment payment = new Payment();
        payment.setOrder(order);

        // Transaction ID: "TXN" + deterministic hash from order id
        payment.setTransactionId(buildTransactionId(order.getId()));

        // Invoice number: INV-YEAR-PADDEDID
        int year = LocalDate.now().getYear();
        payment.setInvoiceNumber(String.format("INV-%d-%06d", year, order.getId()));

        // Payment method mirrors order payment type
        payment.setPaymentMethod(order.getPaymentType());

        // Order amount
        BigDecimal orderAmount = resolveOrderAmount(order);
        payment.setOrderAmount(orderAmount);

        // Shipping charges: use quoted amount if shipment exists, else deterministic mock
        BigDecimal shippingCharges = resolveShippingCharges(order, shipmentOpt);
        payment.setShippingCharges(shippingCharges);

        // Tax: 18% GST on shipping charges only
        BigDecimal tax = shippingCharges.multiply(GST_RATE).setScale(2, RoundingMode.HALF_UP);
        payment.setTax(tax);

        // Total
        payment.setTotalAmount(orderAmount.add(shippingCharges).add(tax).setScale(2, RoundingMode.HALF_UP));

        // Statuses based on order status
        String orderStatus = order.getOrderStatus();
        String paymentStatus = derivePaymentStatus(orderStatus);
        String settlementStatus = deriveSettlementStatus(paymentStatus, orderStatus, order.getUpdatedAt());
        payment.setPaymentStatus(paymentStatus);
        payment.setSettlementStatus(settlementStatus);

        // Settlement date: 3 days after delivery for SETTLED orders
        if ("SETTLED".equals(settlementStatus)) {
            LocalDate settledOn = order.getUpdatedAt()
                    .atZone(ZoneId.systemDefault())
                    .toLocalDate()
                    .plusDays(3);
            payment.setSettlementDate(settledOn);
        }

        return paymentRepository.save(payment);
    }

    private BigDecimal resolveOrderAmount(Order order) {
        if ("COD".equalsIgnoreCase(order.getPaymentType()) && order.getCodAmount() != null) {
            return order.getCodAmount();
        }
        // Deterministic prepaid amount seeded from order DB id
        int idx = (int) (order.getId() % PREPAID_AMOUNTS.length);
        return PREPAID_AMOUNTS[idx];
    }

    private BigDecimal resolveShippingCharges(Order order, Optional<Shipment> shipmentOpt) {
        if (shipmentOpt.isPresent() && shipmentOpt.get().getQuotedAmount() != null) {
            return shipmentOpt.get().getQuotedAmount().setScale(2, RoundingMode.HALF_UP);
        }
        // Deterministic fallback
        int idx = (int) (order.getId() % SHIPPING_OPTIONS.length);
        return SHIPPING_OPTIONS[idx];
    }

    private String derivePaymentStatus(String orderStatus) {
        return switch (orderStatus) {
            case "DELIVERED", "IN_TRANSIT", "OUT_FOR_DELIVERY", "PICKED_UP" -> "PAID";
            case "CANCELLED" -> "REFUNDED";
            case "DELIVERY_FAILED", "RTO" -> "FAILED";
            default -> "PENDING"; // ORDER_CREATED, CARRIER_SELECTED, SHIPMENT_CREATED
        };
    }

    private String deriveSettlementStatus(String paymentStatus, String orderStatus, Instant updatedAt) {
        if (!"PAID".equals(paymentStatus)) {
            return "PENDING";
        }
        if ("DELIVERED".equals(orderStatus)) {
            // Settle after 2+ days
            long daysSinceDelivery = ChronoUnit.DAYS.between(updatedAt, Instant.now());
            return daysSinceDelivery >= 2 ? "SETTLED" : "PROCESSING";
        }
        return "PROCESSING";
    }

    private String buildTransactionId(Long orderId) {
        // Deterministic: TXN + base36-like encoding of (orderId * prime)
        long seed = orderId * 1_000_003L;
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        StringBuilder sb = new StringBuilder("TXN");
        for (int i = 0; i < 12; i++) {
            sb.append(chars.charAt((int) (Math.abs(seed >> i) % chars.length())));
        }
        return sb.toString();
    }

    // ─── Mapping ─────────────────────────────────────────────────────────────────

    private PaymentResponse toResponse(Payment payment) {
        PaymentResponse res = new PaymentResponse();
        res.setPaymentId(payment.getId());
        res.setTransactionId(payment.getTransactionId());
        res.setInvoiceNumber(payment.getInvoiceNumber());
        res.setOrderAmount(payment.getOrderAmount());
        res.setShippingCharges(payment.getShippingCharges());
        res.setTax(payment.getTax());
        res.setTotalAmount(payment.getTotalAmount());
        res.setPaymentMethod(payment.getPaymentMethod());
        res.setPaymentStatus(payment.getPaymentStatus());
        res.setSettlementStatus(payment.getSettlementStatus());
        res.setSettlementDate(payment.getSettlementDate());
        res.setCreatedAt(payment.getCreatedAt());
        res.setUpdatedAt(payment.getUpdatedAt());

        // Enrich with order info
        Order order = payment.getOrder();
        res.setOrderId(order.getZippyOrderId());
        res.setMerchantOrderId(order.getMerchantOrderId());
        res.setCustomerName(order.getCustomerName());

        return res;
    }
}
