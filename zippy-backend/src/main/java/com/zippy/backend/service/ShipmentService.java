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
        Order order = orderRepository.findByZippyOrderId(zippyOrderId)
                .orElseThrow(() -> new OrderNotFoundException(zippyOrderId));

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

        // Selected quote is the quote saved for the order
        ShippingQuote selectedQuote = quotes.get(0);

        CourierClient courierClient = courierClients.stream()
                .filter(client -> client.getCarrierCode().equalsIgnoreCase(selectedQuote.getCarrierCode()))
                .findFirst()
                .orElseThrow(() -> new ValidationException("Courier client not found: " + selectedQuote.getCarrierCode(),
                        Map.of("carrierCode", selectedQuote.getCarrierCode())));

        ShipmentCreationResult result;
        try {
            result = courierClient.createShipment(order, selectedQuote);
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

        order.setOrderStatus("SHIPMENT_CREATED");
        orderRepository.save(order);

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
