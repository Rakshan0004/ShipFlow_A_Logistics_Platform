package com.zippy.backend.dto;

import java.time.Instant;

public record NormalizedShipmentEvent(
        String shipmentLookupKey,
        String carrierEventId,
        String carrierStatus,
        String normalizedStatus,
        String description,
        String location,
        Instant eventTime,
        String rawPayload
) {}
