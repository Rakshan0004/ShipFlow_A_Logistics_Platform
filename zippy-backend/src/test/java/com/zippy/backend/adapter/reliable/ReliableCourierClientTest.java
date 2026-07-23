package com.zippy.backend.adapter.reliable;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.zippy.backend.model.Order;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.web.reactive.function.client.WebClient;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;

class ReliableCourierClientTest {

    private ReliableCourierClient reliableCourierClient;
    private ObjectMapper objectMapper;
    private Order testOrder;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        WebClient webClient = WebClient.create();
        reliableCourierClient = new ReliableCourierClient(webClient, objectMapper, "http://localhost:8081");

        testOrder = new Order();
        testOrder.setPickupPincode("560001");
        testOrder.setDeliveryPincode("110001");
        testOrder.setWeightGrams(1500);
        testOrder.setPaymentType("COD");
        testOrder.setCodAmount(new BigDecimal("2500.00"));
    }

    @Test
    void shouldReturnCarrierCodeAndName() {
        assertThat(reliableCourierClient.getCarrierCode()).isEqualTo("RELIABLE");
        assertThat(reliableCourierClient.getCarrierName()).isEqualTo("ReliableCourier");
    }
}
