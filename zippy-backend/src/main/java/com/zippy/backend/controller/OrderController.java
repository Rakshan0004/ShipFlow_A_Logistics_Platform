package com.zippy.backend.controller;

import com.zippy.backend.dto.*;
import com.zippy.backend.service.CarrierSelectionService;
import com.zippy.backend.service.OrderService;
import com.zippy.backend.service.ShipmentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "*")
public class OrderController {

    private final OrderService orderService;
    private final CarrierSelectionService carrierSelectionService;
    private final ShipmentService shipmentService;

    public OrderController(OrderService orderService,
            CarrierSelectionService carrierSelectionService,
            ShipmentService shipmentService) {
        this.orderService = orderService;
        this.carrierSelectionService = carrierSelectionService;
        this.shipmentService = shipmentService;
    }

    @PostMapping
    public ResponseEntity<OrderResponse> createOrder(@Valid @RequestBody CreateOrderRequest request) {
        OrderResponse response = orderService.createOrder(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<java.util.List<OrderResponse>> getAllOrders() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<OrderResponse> getOrder(@PathVariable String orderId) {
        OrderResponse response = orderService.getOrder(orderId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{orderId}/select-carrier")
    public ResponseEntity<SelectCarrierResponse> selectCarrier(
            @PathVariable String orderId,
            @Valid @RequestBody SelectCarrierRequest request) {
        SelectCarrierResponse response = carrierSelectionService.selectCarrier(orderId, request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{orderId}/create-shipment")
    public ResponseEntity<ShipmentResponse> createShipment(@PathVariable String orderId) {
        ShipmentResponse response = shipmentService.createShipment(orderId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{orderId}/get-amount")
    public ResponseEntity<BigDecimal> getOrderAmount(@PathVariable String orderId) {
        BigDecimal amount = orderService.getOrderAmount(orderId);
        return ResponseEntity.ok(amount);
    }
}
