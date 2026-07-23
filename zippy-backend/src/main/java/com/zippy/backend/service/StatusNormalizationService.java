package com.zippy.backend.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class StatusNormalizationService {

    private static final Logger log = LoggerFactory.getLogger(StatusNormalizationService.class);

    private static final Map<String, Integer> STATUS_RANKS = Map.of(
            "SHIPMENT_CREATED", 1,
            "PICKED_UP", 2,
            "IN_TRANSIT", 3,
            "OUT_FOR_DELIVERY", 4,
            "DELIVERED", 5,
            "DELIVERY_FAILED", 5,
            "RTO", 5
    );

    public String normalizeStatus(String carrierCode, String rawStatus) {
        if (rawStatus == null || carrierCode == null) {
            return "SHIPMENT_CREATED";
        }

        String cleanedCarrier = carrierCode.toUpperCase();
        String cleanedStatus = rawStatus.trim().toUpperCase();

        return switch (cleanedCarrier) {
            case "FASTSHIP" -> switch (cleanedStatus) {
                case "BOOKED" -> "SHIPMENT_CREATED";
                case "PICKED_UP" -> "PICKED_UP";
                case "IN_TRANSIT" -> "IN_TRANSIT";
                case "OUT_FOR_DELIVERY" -> "OUT_FOR_DELIVERY";
                case "DELIVERED" -> "DELIVERED";
                case "DELIVERY_FAILED" -> "DELIVERY_FAILED";
                case "RETURNED" -> "RTO";
                default -> "IN_TRANSIT";
            };
            case "QUICKEXPRESS" -> switch (cleanedStatus) {
                case "SC", "SHIPMENT_CREATED" -> "SHIPMENT_CREATED";
                case "PU", "PICKED_UP" -> "PICKED_UP";
                case "IT", "IN_TRANSIT" -> "IN_TRANSIT";
                case "OFD", "OUT_FOR_DELIVERY" -> "OUT_FOR_DELIVERY";
                case "DLV", "DELIVERED" -> "DELIVERED";
                case "NDR", "DELIVERY_FAILED" -> "DELIVERY_FAILED";
                case "RTO", "RETURNED" -> "RTO";
                default -> "IN_TRANSIT";
            };
            case "RELIABLE", "RELIABLECOURIER" -> switch (cleanedStatus) {
                case "10", "SHIPMENT_CREATED" -> "SHIPMENT_CREATED";
                case "20", "PICKED_UP" -> "PICKED_UP";
                case "30", "IN_TRANSIT" -> "IN_TRANSIT";
                case "40", "OUT_FOR_DELIVERY" -> "OUT_FOR_DELIVERY";
                case "50", "DELIVERED" -> "DELIVERED";
                case "60", "DELIVERY_FAILED" -> "DELIVERY_FAILED";
                case "70", "RETURNED_TO_ORIGIN", "RTO" -> "RTO";
                default -> "IN_TRANSIT";
            };
            default -> "IN_TRANSIT";
        };
    }

    public boolean isValidTransition(String currentStatus, String newStatus) {
        if (currentStatus == null || currentStatus.equalsIgnoreCase(newStatus)) {
            return true;
        }

        int currentRank = STATUS_RANKS.getOrDefault(currentStatus.toUpperCase(), 1);
        int newRank = STATUS_RANKS.getOrDefault(newStatus.toUpperCase(), 1);

        // Terminal state DELIVERED cannot move backward to IN_TRANSIT or PICKED_UP
        if ("DELIVERED".equalsIgnoreCase(currentStatus) && newRank < currentRank) {
            log.warn("Invalid transition: cannot move from DELIVERED back to {}", newStatus);
            return false;
        }

        if (newRank < currentRank) {
            log.warn("Invalid status regression from {} (rank {}) to {} (rank {})",
                    currentStatus, currentRank, newStatus, newRank);
            return false;
        }

        return true;
    }
}
