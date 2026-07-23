package com.zippy.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.zippy.backend.model.Order;
import com.zippy.backend.model.Shipment;
import com.zippy.backend.model.ShipmentEvent;
import com.zippy.backend.repository.OrderRepository;
import com.zippy.backend.repository.ShipmentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Optional;

@Service
public class WebhookProcessingService {

    private static final Logger log = LoggerFactory.getLogger(WebhookProcessingService.class);

    public record WebhookResult(String status, String message) {}

    private final ShipmentRepository shipmentRepository;
    private final EventPersistenceService eventPersistenceService;
    private final OrderRepository orderRepository;
    private final StatusNormalizationService statusNormalizationService;
    private final ObjectMapper objectMapper;

    public WebhookProcessingService(ShipmentRepository shipmentRepository,
                                    EventPersistenceService eventPersistenceService,
                                    OrderRepository orderRepository,
                                    StatusNormalizationService statusNormalizationService,
                                    ObjectMapper objectMapper) {
        this.shipmentRepository = shipmentRepository;
        this.eventPersistenceService = eventPersistenceService;
        this.orderRepository = orderRepository;
        this.statusNormalizationService = statusNormalizationService;
        this.objectMapper = objectMapper;
    }

    @Transactional
    public WebhookResult processFastShipWebhook(String payload) {
        try {
            JsonNode root = objectMapper.readTree(payload);
            String shipmentId = root.path("shipment_id").asText(null);
            String trackingNumber = root.path("tracking_number").asText(null);
            String eventCode = root.path("event_code").asText(null);
            String eventDescription = root.path("event_description").asText(null);
            String eventTimeStr = root.path("event_time").asText(null);
            String location = root.path("location").asText(null);

            Optional<Shipment> shipmentOpt = findShipment(trackingNumber, shipmentId);
            if (shipmentOpt.isEmpty()) {
                log.warn("Received FastShip webhook for unknown shipment: tracking={}, shipmentId={}", trackingNumber, shipmentId);
                return new WebhookResult("IGNORED", "UNKNOWN_SHIPMENT");
            }

            String idempotencyKey = shipmentId != null ? shipmentId + "_" + eventCode : trackingNumber + "_" + eventCode;
            Instant eventTime = parseInstant(eventTimeStr);

            return ingestEvent(shipmentOpt.get(), "FASTSHIP", idempotencyKey, eventCode, eventDescription, location, eventTime, payload);
        } catch (Exception e) {
            log.error("Failed to parse FastShip webhook payload: {}", e.getMessage());
            return new WebhookResult("ERROR", e.getMessage());
        }
    }

    @Transactional
    public WebhookResult processQuickExpressWebhook(String payload) {
        try {
            JsonNode root = objectMapper.readTree(payload);
            String awb = root.path("awb").asText(null);
            JsonNode eventNode = root.path("event");
            String eventType = eventNode.path("type").asText(null);
            String message = eventNode.path("message").asText(null);
            String occurredAtStr = eventNode.path("occurredAt").asText(null);
            String city = root.path("facility").path("city").asText(null);

            Optional<Shipment> shipmentOpt = findShipment(awb, null);
            if (shipmentOpt.isEmpty()) {
                log.warn("Received QuickExpress webhook for unknown AWB: {}", awb);
                return new WebhookResult("IGNORED", "UNKNOWN_SHIPMENT");
            }

            String idempotencyKey = awb + "_" + eventType;
            Instant eventTime = parseInstant(occurredAtStr);

            return ingestEvent(shipmentOpt.get(), "QUICKEXPRESS", idempotencyKey, eventType, message, city, eventTime, payload);
        } catch (Exception e) {
            log.error("Failed to parse QuickExpress webhook payload: {}", e.getMessage());
            return new WebhookResult("ERROR", e.getMessage());
        }
    }

    @Transactional
    public WebhookResult processReliableWebhook(String payload) {
        try {
            JsonNode root = objectMapper.readTree(payload);
            String trackingCode = root.path("trackingCode").asText(null);
            String statusId = root.path("statusId").asText(null);
            String statusText = root.path("statusText").asText(null);
            String updatedOnStr = root.path("updatedOn").asText(null);
            String deliveryLocation = root.path("proofOfDelivery").path("deliveryLocation").asText(null);

            Optional<Shipment> shipmentOpt = findShipment(trackingCode, null);
            if (shipmentOpt.isEmpty()) {
                log.warn("Received ReliableCourier webhook for unknown trackingCode: {}", trackingCode);
                return new WebhookResult("IGNORED", "UNKNOWN_SHIPMENT");
            }

            String idempotencyKey = trackingCode + "_" + statusId;
            Instant eventTime = parseInstant(updatedOnStr);

            return ingestEvent(shipmentOpt.get(), "RELIABLE", idempotencyKey, statusId != null ? statusId : statusText, statusText, deliveryLocation, eventTime, payload);
        } catch (Exception e) {
            log.error("Failed to parse ReliableCourier webhook payload: {}", e.getMessage());
            return new WebhookResult("ERROR", e.getMessage());
        }
    }

    private WebhookResult ingestEvent(Shipment shipment, String carrierCode, String idempotencyKey,
                                       String carrierStatus, String description, String location,
                                       Instant eventTime, String rawPayload) {

        String normalizedStatus = statusNormalizationService.normalizeStatus(carrierCode, carrierStatus);

        if (!statusNormalizationService.isValidTransition(shipment.getCurrentStatus(), normalizedStatus)) {
            log.warn("Rejected invalid status transition for shipment tracking {}: current={}, proposed={}",
                    shipment.getTrackingNumber(), shipment.getCurrentStatus(), normalizedStatus);
            return new WebhookResult("REJECTED_INVALID_TRANSITION", "Invalid transition from " + shipment.getCurrentStatus() + " to " + normalizedStatus);
        }

        ShipmentEvent event = new ShipmentEvent();
        event.setShipment(shipment);
        event.setCarrierEventId(idempotencyKey);
        event.setCarrierStatus(carrierStatus);
        event.setNormalizedStatus(normalizedStatus);
        event.setDescription(description);
        event.setLocation(location);
        event.setEventTime(eventTime);
        event.setRawEventPayload(rawPayload);

        boolean saved = eventPersistenceService.saveEventIdempotently(event);
        if (!saved) {
            log.info("Duplicate webhook event ignored for key: {}", idempotencyKey);
            return new WebhookResult("DUPLICATE_IGNORED", "Event already processed");
        }

        // Update shipment & order statuses
        shipment.setCurrentStatus(normalizedStatus);
        shipmentRepository.save(shipment);

        Order order = shipment.getOrder();
        if (order != null) {
            order.setOrderStatus(normalizedStatus);
            orderRepository.save(order);
        }

        return new WebhookResult("PROCESSED", "Event recorded successfully");
    }

    private Optional<Shipment> findShipment(String trackingNumber, String carrierShipmentId) {
        if (trackingNumber != null) {
            Optional<Shipment> byTracking = shipmentRepository.findByTrackingNumber(trackingNumber);
            if (byTracking.isPresent()) {
                return byTracking;
            }
        }
        if (carrierShipmentId != null) {
            return shipmentRepository.findByCarrierShipmentId(carrierShipmentId);
        }
        return Optional.empty();
    }

    private Instant parseInstant(String timeStr) {
        if (timeStr == null || timeStr.isBlank()) {
            return Instant.now();
        }
        try {
            return Instant.parse(timeStr);
        } catch (Exception e) {
            return Instant.now();
        }
    }
}
