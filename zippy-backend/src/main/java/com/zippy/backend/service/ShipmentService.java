package com.zippy.backend.service;

import com.zippy.backend.adapter.CourierClient;
import com.zippy.backend.dto.ShipmentCreationResult;
import com.zippy.backend.dto.ShipmentResponse;
import com.zippy.backend.exception.*;
import com.zippy.backend.model.Order;
import com.zippy.backend.model.Shipment;
import com.zippy.backend.model.ShippingQuote;
import com.zippy.backend.repository.OrderRepository;
import com.zippy.backend.repository.ShipmentRepository;
import com.zippy.backend.repository.ShippingQuoteRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@Transactional(readOnly = true)
public class ShipmentService {

    private static final Logger log = LoggerFactory.getLogger(ShipmentService.class);

    private final OrderRepository orderRepository;
    private final ShippingQuoteRepository shippingQuoteRepository;
    private final ShipmentRepository shipmentRepository;
    private final List<CourierClient> courierClients;

    public ShipmentService(OrderRepository orderRepository,
                           ShippingQuoteRepository shippingQuoteRepository,
                           ShipmentRepository shipmentRepository,
                           List<CourierClient> courierClients) {
        this.orderRepository = orderRepository;
        this.shippingQuoteRepository = shippingQuoteRepository;
        this.shipmentRepository = shipmentRepository;
        this.courierClients = courierClients;
    }

    @Transactional
    public ShipmentResponse createShipment(String zippyOrderId) {
        log.info("===== SHIPMENT CREATION START =====");
        log.info("Order ID: {}", zippyOrderId);
        
        Order order = orderRepository.findByZippyOrderId(zippyOrderId)
                .orElseThrow(() -> new OrderNotFoundException(zippyOrderId));

        log.info("Order found - Status: {}, Selected Carrier: {}, Service: {}", 
                order.getOrderStatus(), order.getSelectedCarrierCode(), order.getSelectedServiceCode());

        if ("ORDER_CREATED".equalsIgnoreCase(order.getOrderStatus())) {
            throw new ValidationException("Carrier selection is required before creating a shipment",
                    Map.of("orderStatus", order.getOrderStatus()));
        }

        if ("SHIPMENT_CREATED".equalsIgnoreCase(order.getOrderStatus())) {
            Optional<Shipment> existingShipment = shipmentRepository.findByOrderId(order.getId());
            if (existingShipment.isPresent()) {
                throw new IllegalStateTransitionException("Shipment already exists for order: " + zippyOrderId);
            }
        }

        List<ShippingQuote> quotes = shippingQuoteRepository.findByOrderId(order.getId());
        if (quotes.isEmpty()) {
            throw new ValidationException("No shipping quote found for order: " + zippyOrderId, Map.of("orderId", zippyOrderId));
        }

        log.info("Found {} quotes for order", quotes.size());

        // Find the selected quote based on carrier and service code from the order
        ShippingQuote selectedQuote = quotes.stream()
                .filter(q -> q.getCarrierCode().equalsIgnoreCase(order.getSelectedCarrierCode())
                        && q.getServiceCode().equalsIgnoreCase(order.getSelectedServiceCode()))
                .findFirst()
                .orElseGet(() -> {
                    log.warn("Selected carrier {} / {} not found in quotes for order {}, using first available quote", 
                            order.getSelectedCarrierCode(), order.getSelectedServiceCode(), zippyOrderId);
                    return quotes.get(0);
                });

        log.info("Selected quote - Carrier: {}, Service: {}", selectedQuote.getCarrierCode(), selectedQuote.getServiceCode());

        CourierClient courierClient = courierClients.stream()
                .filter(client -> client.getCarrierCode().equalsIgnoreCase(selectedQuote.getCarrierCode()))
                .findFirst()
                .orElseThrow(() -> new ValidationException("Courier client not found: " + selectedQuote.getCarrierCode(),
                        Map.of("carrierCode", selectedQuote.getCarrierCode())));

        ShipmentCreationResult result;
        try {
            result = courierClient.createShipment(order, selectedQuote);
            log.info("Courier API success - Carrier: {}, Tracking: {}", result.carrierCode(), result.trackingNumber());
        } catch (Exception e) {
            log.error("Shipment creation failed for carrier {}: {}", selectedQuote.getCarrierCode(), e.getMessage());
            throw new CourierShipmentCreationException(selectedQuote.getCarrierCode(), e.getMessage());
        }

        Shipment shipment = new Shipment();
        shipment.setOrder(order);
        shipment.setCarrierCode(result.carrierCode());
        shipment.setCarrierShipmentId(result.carrierShipmentId());
        shipment.setTrackingNumber(result.trackingNumber());
        shipment.setSelectedServiceCode(selectedQuote.getServiceCode());
        shipment.setQuotedAmount(selectedQuote.getTotalCharge());
        shipment.setCurrentStatus("SHIPMENT_CREATED");

        Shipment savedShipment = shipmentRepository.save(shipment);
        log.info("Shipment saved - ID: {}, Carrier: {}", savedShipment.getId(), savedShipment.getCarrierCode());

        order.setOrderStatus("SHIPMENT_CREATED");
        orderRepository.save(order);

        log.info("===== SHIPMENT CREATION END =====");

        ShipmentResponse.ShipmentDetail detail = new ShipmentResponse.ShipmentDetail(
                savedShipment.getCarrierCode(),
                savedShipment.getCarrierShipmentId(),
                savedShipment.getTrackingNumber(),
                savedShipment.getSelectedServiceCode(),
                savedShipment.getQuotedAmount(),
                savedShipment.getCurrentStatus(),
                savedShipment.getCreatedAt()
        );

        return new ShipmentResponse(order.getZippyOrderId(), order.getOrderStatus(), detail);
    }
}
