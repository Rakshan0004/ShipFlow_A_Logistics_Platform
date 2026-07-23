package com.zippy.backend.service;

import com.zippy.backend.dto.CreateOrderRequest;
import com.zippy.backend.dto.OrderResponse;
import com.zippy.backend.exception.OrderNotFoundException;
import com.zippy.backend.exception.ValidationException;
import com.zippy.backend.mapper.OrderMapper;
import com.zippy.backend.model.Order;
import com.zippy.backend.repository.OrderRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.atomic.AtomicLong;

@Service
@Transactional(readOnly = true)
public class OrderService {

    private static final String ID_PREFIX = "ZPY-ORD-";
    private static final long INITIAL_SEQUENCE = 10001L;

    private final OrderRepository orderRepository;
    private final AtomicLong sequenceCounter = new AtomicLong(INITIAL_SEQUENCE);

    public OrderService(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
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
        return OrderMapper.toResponse(order);
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
}
