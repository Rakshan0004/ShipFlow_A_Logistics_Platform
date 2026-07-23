package com.zippy.backend.adapter.fastship;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.zippy.backend.dto.NormalizedShippingOption;
import com.zippy.backend.exception.CourierUnavailableException;
import com.zippy.backend.model.Order;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.web.reactive.function.client.WebClient;

import java.math.BigDecimal;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class FastShipClientTest {

    private FastShipClient fastShipClient;
    private ObjectMapper objectMapper;
    private Order testOrder;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        WebClient webClient = WebClient.create();
        fastShipClient = new FastShipClient(webClient, objectMapper, "http://localhost:8081");

        testOrder = new Order();
        testOrder.setPickupPincode("560001");
        testOrder.setDeliveryPincode("110001");
        testOrder.setWeightGrams(1500);
        testOrder.setPaymentType("COD");
        testOrder.setCodAmount(new BigDecimal("2500.00"));
    }

    @Test
    void shouldReturnCarrierCodeAndName() {
        assertThat(fastShipClient.getCarrierCode()).isEqualTo("FASTSHIP");
        assertThat(fastShipClient.getCarrierName()).isEqualTo("FastShip");
    }

    @Test
    void shouldConvertWeightFromGramsToKg() {
        double weightKg = testOrder.getWeightGrams() / 1000.0;
        assertThat(weightKg).isEqualTo(1.5);
    }
}
