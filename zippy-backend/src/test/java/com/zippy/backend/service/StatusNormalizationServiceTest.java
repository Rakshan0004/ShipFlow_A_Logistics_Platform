package com.zippy.backend.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

import static org.assertj.core.api.Assertions.assertThat;

class StatusNormalizationServiceTest {

    private StatusNormalizationService service;

    @BeforeEach
    void setUp() {
        service = new StatusNormalizationService();
    }

    @ParameterizedTest
    @CsvSource({
            "FASTSHIP, BOOKED, SHIPMENT_CREATED",
            "FASTSHIP, PICKED_UP, PICKED_UP",
            "FASTSHIP, IN_TRANSIT, IN_TRANSIT",
            "FASTSHIP, OUT_FOR_DELIVERY, OUT_FOR_DELIVERY",
            "FASTSHIP, DELIVERED, DELIVERED",
            "FASTSHIP, DELIVERY_FAILED, DELIVERY_FAILED",
            "FASTSHIP, RETURNED, RTO",
            "QUICKEXPRESS, SC, SHIPMENT_CREATED",
            "QUICKEXPRESS, PU, PICKED_UP",
            "QUICKEXPRESS, IT, IN_TRANSIT",
            "QUICKEXPRESS, OFD, OUT_FOR_DELIVERY",
            "QUICKEXPRESS, DLV, DELIVERED",
            "QUICKEXPRESS, NDR, DELIVERY_FAILED",
            "QUICKEXPRESS, RTO, RTO",
            "RELIABLE, 10, SHIPMENT_CREATED",
            "RELIABLE, 20, PICKED_UP",
            "RELIABLE, 30, IN_TRANSIT",
            "RELIABLE, 40, OUT_FOR_DELIVERY",
            "RELIABLE, 50, DELIVERED",
            "RELIABLE, 60, DELIVERY_FAILED",
            "RELIABLE, 70, RTO"
    })
    void shouldNormalizeCourierStatusesToZippyStatuses(String carrier, String rawStatus, String expectedZippyStatus) {
        String normalized = service.normalizeStatus(carrier, rawStatus);
        assertThat(normalized).isEqualTo(expectedZippyStatus);
    }

    @Test
    void shouldValidateValidStatusTransitions() {
        assertThat(service.isValidTransition("SHIPMENT_CREATED", "PICKED_UP")).isTrue();
        assertThat(service.isValidTransition("PICKED_UP", "IN_TRANSIT")).isTrue();
        assertThat(service.isValidTransition("IN_TRANSIT", "OUT_FOR_DELIVERY")).isTrue();
        assertThat(service.isValidTransition("OUT_FOR_DELIVERY", "DELIVERED")).isTrue();
    }

    @Test
    void shouldRejectInvalidStatusRegressions() {
        assertThat(service.isValidTransition("DELIVERED", "IN_TRANSIT")).isFalse();
        assertThat(service.isValidTransition("DELIVERED", "PICKED_UP")).isFalse();
        assertThat(service.isValidTransition("OUT_FOR_DELIVERY", "PICKED_UP")).isFalse();
    }
}
