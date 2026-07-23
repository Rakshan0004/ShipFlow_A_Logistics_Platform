package com.zippy.backend.dto;

public record ShipmentCreationResult(
        String carrierCode,
        String carrierShipmentId,
        String trackingNumber,
        String labelUrl,
        String status
) {}
