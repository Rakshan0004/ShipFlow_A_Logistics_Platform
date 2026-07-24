package com.zippy.backend.controller;

import com.zippy.backend.exception.OrderNotFoundException;
import com.zippy.backend.model.Order;
import com.zippy.backend.model.Shipment;
import com.zippy.backend.model.ShipmentEvent;
import com.zippy.backend.repository.OrderRepository;
import com.zippy.backend.repository.ShipmentEventRepository;
import com.zippy.backend.repository.ShipmentRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@CrossOrigin(origins = "*")
public class TrackingController {

    private final OrderRepository orderRepository;
    private final ShipmentRepository shipmentRepository;
    private final ShipmentEventRepository shipmentEventRepository;

    public TrackingController(OrderRepository orderRepository,
                               ShipmentRepository shipmentRepository,
                               ShipmentEventRepository shipmentEventRepository) {
        this.orderRepository = orderRepository;
        this.shipmentRepository = shipmentRepository;
        this.shipmentEventRepository = shipmentEventRepository;
    }

    @GetMapping("/api/orders/{orderId}/tracking")
    public ResponseEntity<?> getOrderTracking(@PathVariable String orderId) {
        return lookupTracking(orderId);
    }

    @GetMapping("/api/orders/track/{identifier}")
    public ResponseEntity<?> trackByIdentifier(@PathVariable String identifier) {
        return lookupTracking(identifier);
    }

    private ResponseEntity<?> lookupTracking(String query) {
        if (query == null || query.trim().isEmpty()) {
            throw new OrderNotFoundException("empty_query");
        }

        String search = query.trim();

        // 1. Try Zippy Order ID
        Optional<Order> orderOpt = orderRepository.findByZippyOrderId(search);

        // 2. Try Merchant Order ID
        if (orderOpt.isEmpty()) {
            orderOpt = orderRepository.findFirstByMerchantOrderIdOrderByIdDesc(search);
        }

        // 3. Try Tracking AWB Number
        if (orderOpt.isEmpty()) {
            Optional<Shipment> shipmentOpt = shipmentRepository.findByTrackingNumber(search);
            if (shipmentOpt.isPresent()) {
                orderOpt = Optional.ofNullable(shipmentOpt.get().getOrder());
            }
        }

        if (orderOpt.isEmpty()) {
            throw new OrderNotFoundException(search);
        }

        Order order = orderOpt.get();
        Optional<Shipment> shipmentOpt = shipmentRepository.findByOrderId(order.getId());

        Map<String, Object> response = new HashMap<>();
        response.put("orderId", order.getZippyOrderId());
        response.put("merchantOrderId", order.getMerchantOrderId());
        response.put("customerName", order.getCustomerName());
        response.put("customerPhone", order.getCustomerPhone());
        response.put("customerEmail", order.getCustomerEmail());
        response.put("pickupCity", order.getPickupCity());
        response.put("deliveryCity", order.getDeliveryCity());
        response.put("orderStatus", order.getOrderStatus());
        response.put("paymentType", order.getPaymentType());
        response.put("codAmount", order.getCodAmount());

        if (shipmentOpt.isEmpty()) {
            response.put("shipment", null);
            response.put("eventHistory", List.of());
            return ResponseEntity.ok(response);
        }

        Shipment shipment = shipmentOpt.get();
        List<ShipmentEvent> events = shipmentEventRepository.findByShipmentIdOrderByEventTimeAsc(shipment.getId());

        List<Map<String, Object>> eventHistory = events.stream()
                .map(e -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("carrierEventId", e.getCarrierEventId() != null ? e.getCarrierEventId() : "");
                    map.put("carrierStatus", e.getCarrierStatus());
                    map.put("normalizedStatus", e.getNormalizedStatus());
                    map.put("description", e.getDescription() != null ? e.getDescription() : "");
                    map.put("location", e.getLocation() != null ? e.getLocation() : "");
                    map.put("eventTime", e.getEventTime());
                    return map;
                })
                .toList();

        Map<String, Object> shipmentMap = new HashMap<>();
        shipmentMap.put("carrierCode", shipment.getCarrierCode());
        shipmentMap.put("carrierShipmentId", shipment.getCarrierShipmentId() != null ? shipment.getCarrierShipmentId() : "");
        shipmentMap.put("trackingNumber", shipment.getTrackingNumber() != null ? shipment.getTrackingNumber() : "");
        shipmentMap.put("serviceCode", shipment.getSelectedServiceCode());
        shipmentMap.put("quotedAmount", shipment.getQuotedAmount());
        shipmentMap.put("currentStatus", shipment.getCurrentStatus());

        response.put("shipment", shipmentMap);
        response.put("eventHistory", eventHistory);

        return ResponseEntity.ok(response);
    }
}
