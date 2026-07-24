package com.zippy.mockcourier.common;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Instant;
import java.util.Map;

@RestController
@RequestMapping("/mock/shipments")
@CrossOrigin(origins = "*")
public class MockStatusTriggerController {

    private static final Logger log = LoggerFactory.getLogger(MockStatusTriggerController.class);

    private final MockShipmentStore mockShipmentStore;
    private final WebClient webClient;
    private final ObjectMapper objectMapper;

    public MockStatusTriggerController(MockShipmentStore mockShipmentStore, WebClient webClient, ObjectMapper objectMapper) {
        this.mockShipmentStore = mockShipmentStore;
        this.webClient = webClient;
        this.objectMapper = objectMapper;
    }

    @PostMapping("/{carrierId}/advance")
    public ResponseEntity<?> advanceStatus(
            @PathVariable String carrierId,
            @RequestBody Map<String, String> request) {

        String trackingNumber = request.get("trackingNumber");
        if (trackingNumber == null || trackingNumber.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "trackingNumber is required"));
        }

        var opt = mockShipmentStore.findByTracking(trackingNumber);
        MockShipmentStore.MockShipmentRecord record;
        if (opt.isPresent()) {
            record = opt.get();
        } else {
            record = new MockShipmentStore.MockShipmentRecord(
                    carrierId.toUpperCase(),
                    "FS-" + trackingNumber,
                    trackingNumber,
                    "ZPY-REF-100",
                    "STANDARD",
                    "SHIPMENT_CREATED",
                    null
            );
        }

        String nextStatus = getNextStatus(record.carrierCode(), record.currentStatus());
        MockShipmentStore.MockShipmentRecord updatedRecord = new MockShipmentStore.MockShipmentRecord(
                record.carrierCode(),
                record.shipmentId(),
                record.trackingNumber(),
                record.orderReference(),
                record.serviceCode(),
                nextStatus,
                record.callbackUrl()
        );
        mockShipmentStore.save(updatedRecord);

        return sendWebhook(updatedRecord, nextStatus);
    }

    @PostMapping("/{carrierId}/set-status")
    public ResponseEntity<?> setStatus(
            @PathVariable String carrierId,
            @RequestBody Map<String, String> request) {

        String trackingNumber = request.get("trackingNumber");
        String status = request.get("status");

        if (trackingNumber == null || status == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "trackingNumber and status are required"));
        }

        var opt = mockShipmentStore.findByTracking(trackingNumber);
        MockShipmentStore.MockShipmentRecord record;
        if (opt.isPresent()) {
            record = opt.get();
        } else {
            record = new MockShipmentStore.MockShipmentRecord(
                    carrierId.toUpperCase(),
                    "FS-" + trackingNumber,
                    trackingNumber,
                    "ZPY-REF-100",
                    "STANDARD",
                    status,
                    null
            );
        }

        MockShipmentStore.MockShipmentRecord updatedRecord = new MockShipmentStore.MockShipmentRecord(
                record.carrierCode(),
                record.shipmentId(),
                record.trackingNumber(),
                record.orderReference(),
                record.serviceCode(),
                status,
                record.callbackUrl()
        );
        mockShipmentStore.save(updatedRecord);

        return sendWebhook(updatedRecord, status);
    }

    private ResponseEntity<?> sendWebhook(MockShipmentStore.MockShipmentRecord record, String targetStatus) {
        String callbackUrl = record.callbackUrl();
        if (callbackUrl == null || callbackUrl.isBlank()) {
            String backendHost = System.getenv("ZIPPY_BACKEND_HOST");
            if (backendHost == null || backendHost.isBlank()) {
                backendHost = "localhost";
            }
            callbackUrl = switch (record.carrierCode().toUpperCase()) {
                case "FASTSHIP" -> "http://" + backendHost + ":8080/api/webhooks/fastship";
                case "QUICKEXPRESS" -> "http://" + backendHost + ":8080/api/webhooks/quickexpress";
                default -> "http://" + backendHost + ":8080/api/webhooks/reliable";
            };
        } else if (callbackUrl.contains("zippy-backend") && !callbackUrl.contains(":8080")) {
            callbackUrl = callbackUrl.replace("zippy-backend", "zippy-backend:8080");
        }

        Object webhookPayload = buildPayload(record, targetStatus);
        boolean sent = false;
        String responseDetail = "";

        try {
            var response = webClient.post()
                    .uri(callbackUrl)
                    .bodyValue(webhookPayload)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();
            sent = true;
            responseDetail = response != null ? response : "HTTP 200 OK";
        } catch (Exception e) {
            log.warn("Failed to dispatch webhook to {}: {}", callbackUrl, e.getMessage());
            responseDetail = "Error: " + e.getMessage();
        }

        return ResponseEntity.ok(Map.of(
                "carrier", record.carrierCode(),
                "trackingNumber", record.trackingNumber(),
                "previousStatus", record.currentStatus(),
                "newStatus", targetStatus,
                "webhookSent", sent,
                "targetCallbackUrl", callbackUrl,
                "backendResponseBody", responseDetail
        ));
    }

    private String getNextStatus(String carrierCode, String currentStatus) {
        return switch (currentStatus.toUpperCase()) {
            case "SHIPMENT_CREATED", "BOOKED", "SC", "10" -> "PICKED_UP";
            case "PICKED_UP", "PU", "20" -> "IN_TRANSIT";
            case "IN_TRANSIT", "IT", "30" -> "OUT_FOR_DELIVERY";
            case "OUT_FOR_DELIVERY", "OFD", "40" -> "DELIVERED";
            default -> "DELIVERED";
        };
    }

    private Object buildPayload(MockShipmentStore.MockShipmentRecord record, String status) {
        String now = Instant.now().toString();

        return switch (record.carrierCode().toUpperCase()) {
            case "FASTSHIP" -> Map.of(
                    "shipment_id", record.shipmentId(),
                    "tracking_number", record.trackingNumber(),
                    "event_code", status,
                    "event_description", "Status updated to " + status,
                    "event_time", now,
                    "location", "Hub"
            );
            case "QUICKEXPRESS" -> Map.of(
                    "awb", record.trackingNumber(),
                    "event", Map.of(
                            "type", mapToQeCode(status),
                            "message", "Status updated to " + status,
                            "occurredAt", now
                    ),
                    "facility", Map.of("city", "Bengaluru", "code", "BLR-01")
            );
            default -> Map.of(
                    "trackingCode", record.trackingNumber(),
                    "statusId", mapToReliableCode(status),
                    "statusText", status,
                    "updatedOn", now,
                    "proofOfDelivery", Map.of("receivedBy", "Consignee", "deliveryLocation", "Location")
            );
        };
    }

    private String mapToQeCode(String status) {
        return switch (status.toUpperCase()) {
            case "PICKED_UP" -> "PU";
            case "IN_TRANSIT" -> "IT";
            case "OUT_FOR_DELIVERY" -> "OFD";
            case "DELIVERED" -> "DLV";
            case "DELIVERY_FAILED" -> "NDR";
            case "RTO" -> "RTO";
            default -> "SC";
        };
    }

    private int mapToReliableCode(String status) {
        return switch (status.toUpperCase()) {
            case "PICKED_UP" -> 20;
            case "IN_TRANSIT" -> 30;
            case "OUT_FOR_DELIVERY" -> 40;
            case "DELIVERED" -> 50;
            case "DELIVERY_FAILED" -> 60;
            case "RTO" -> 70;
            default -> 10;
        };
    }
}
