package com.zippy.backend.service;

import com.zippy.backend.dto.CreateOrderRequest;
import com.zippy.backend.dto.OrderResponse;
import com.zippy.backend.dto.RecentOrderDto;
import com.zippy.backend.exception.OrderNotFoundException;
import com.zippy.backend.exception.ValidationException;
import com.zippy.backend.mapper.OrderMapper;
import com.zippy.backend.model.Order;
import com.zippy.backend.model.Shipment;
import com.zippy.backend.repository.OrderRepository;
import com.zippy.backend.repository.ShipmentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicLong;

@Service
@Transactional(readOnly = true)
public class OrderService {

    private static final String ID_PREFIX = "ZPY-ORD-";
    private static final long INITIAL_SEQUENCE = 10001L;

    private final OrderRepository orderRepository;
    private final ShipmentRepository shipmentRepository;
    private final AtomicLong sequenceCounter = new AtomicLong(INITIAL_SEQUENCE);

    public OrderService(OrderRepository orderRepository, ShipmentRepository shipmentRepository) {
        this.orderRepository = orderRepository;
        this.shipmentRepository = shipmentRepository;
    }

    @Transactional
    public OrderResponse createOrder(CreateOrderRequest request) {
        validateOrderRequest(request);

        Order order = OrderMapper.toEntity(request);
        String zippyOrderId = generateZippyOrderId();
        order.setZippyOrderId(zippyOrderId);

        Order savedOrder = orderRepository.save(order);
        return OrderMapper.toResponse(savedOrder);
    }

    public OrderResponse getOrder(String zippyOrderId) {
        Order order = orderRepository.findByZippyOrderId(zippyOrderId)
                .orElseThrow(() -> new OrderNotFoundException(zippyOrderId));
        OrderResponse response = OrderMapper.toResponse(order);
        embedShipmentData(response, zippyOrderId);
        return response;
    }

    public java.util.List<OrderResponse> getAllOrders() {
        return orderRepository.findAll().stream()
                .map(order -> {
                    OrderResponse response = OrderMapper.toResponse(order);
                    embedShipmentData(response, order.getZippyOrderId());
                    return response;
                })
                .toList();
    }

    /**
     * Looks up the shipment for this order and embeds its key fields
     * (currentStatus, awbNumber, carrierCode) into the response so the
     * frontend always sees the real tracking status rather than the coarse
     * order-level status.
     */
    private void embedShipmentData(OrderResponse response, String zippyOrderId) {
        Optional<Shipment> shipmentOpt = shipmentRepository.findByOrder_ZippyOrderId(zippyOrderId);
        if (shipmentOpt.isPresent()) {
            Shipment s = shipmentOpt.get();
            Map<String, Object> shipmentMap = new HashMap<>();
            shipmentMap.put("currentStatus", s.getCurrentStatus());
            shipmentMap.put("awbNumber", s.getTrackingNumber());
            shipmentMap.put("carrierCode", s.getCarrierCode());
            shipmentMap.put("carrierShipmentId", s.getCarrierShipmentId());
            response.setShipment(shipmentMap);
        }
    }

    private void validateOrderRequest(CreateOrderRequest request) {
        Map<String, String> details = new HashMap<>();

        if ("COD".equalsIgnoreCase(request.getPaymentType())) {
            if (request.getCodAmount() == null || request.getCodAmount().compareTo(BigDecimal.ZERO) <= 0) {
                details.put("codAmount", "COD amount is required and must be greater than 0 when paymentType is COD");
            }
        } else if (!"PREPAID".equalsIgnoreCase(request.getPaymentType())) {
            details.put("paymentType", "Payment type must be PREPAID or COD");
        }

        if (request.getPackageInfo() != null && request.getPackageInfo().getWeightGrams() != null) {
            if (request.getPackageInfo().getWeightGrams() <= 0) {
                details.put("packageInfo.weightGrams", "Package weight must be greater than 0");
            }
        }

        if (!details.isEmpty()) {
            throw new ValidationException("Order validation failed", details);
        }
    }

    private synchronized String generateZippyOrderId() {
        long currentCount = orderRepository.count();
        long nextSeq = INITIAL_SEQUENCE + currentCount;
        return ID_PREFIX + nextSeq;
    }

    public java.math.BigDecimal getOrderAmount(String orderId) {
        Order order = orderRepository.findByZippyOrderId(orderId)
                .orElseThrow(() -> new OrderNotFoundException(orderId));

        return order.getCodAmount();
    }
}
