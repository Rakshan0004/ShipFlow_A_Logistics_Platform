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

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/orders/{orderId}/tracking")
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

    @GetMapping
    public ResponseEntity<?> getOrderTracking(@PathVariable String orderId) {
        Order order = orderRepository.findByZippyOrderId(orderId)
                .orElseThrow(() -> new OrderNotFoundException(orderId));

        Optional<Shipment> shipmentOpt = shipmentRepository.findByOrderId(order.getId());
        if (shipmentOpt.isEmpty()) {
            return ResponseEntity.ok(Map.of(
                    "orderId", order.getZippyOrderId(),
                    "orderStatus", order.getOrderStatus(),
                    "shipment", null,
                    "eventHistory", List.of()
            ));
        }

        Shipment shipment = shipmentOpt.get();
        List<ShipmentEvent> events = shipmentEventRepository.findByShipmentIdOrderByEventTimeAsc(shipment.getId());

        List<Map<String, Object>> eventHistory = events.stream()
                .map(e -> Map.<String, Object>of(
                        "carrierEventId", e.getCarrierEventId() != null ? e.getCarrierEventId() : "",
                        "carrierStatus", e.getCarrierStatus(),
                        "normalizedStatus", e.getNormalizedStatus(),
                        "description", e.getDescription() != null ? e.getDescription() : "",
                        "location", e.getLocation() != null ? e.getLocation() : "",
                        "eventTime", e.getEventTime()
                ))
                .toList();

        Map<String, Object> response = Map.of(
                "orderId", order.getZippyOrderId(),
                "orderStatus", order.getOrderStatus(),
                "shipment", Map.of(
                        "carrierCode", shipment.getCarrierCode(),
                        "carrierShipmentId", shipment.getCarrierShipmentId() != null ? shipment.getCarrierShipmentId() : "",
                        "trackingNumber", shipment.getTrackingNumber() != null ? shipment.getTrackingNumber() : "",
                        "serviceCode", shipment.getSelectedServiceCode(),
                        "quotedAmount", shipment.getQuotedAmount(),
                        "currentStatus", shipment.getCurrentStatus()
                ),
                "eventHistory", eventHistory
        );

        return ResponseEntity.ok(response);
    }
}
