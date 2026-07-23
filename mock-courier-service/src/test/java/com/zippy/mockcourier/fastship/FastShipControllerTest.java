package com.zippy.mockcourier.fastship;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.zippy.mockcourier.common.MockShipmentStore;
import com.zippy.mockcourier.fastship.dto.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(FastShipController.class)
class FastShipControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private MockShipmentStore mockShipmentStore;

    private FastShipRateRequest rateRequest;
    private FastShipShipmentRequest shipmentRequest;

    @BeforeEach
    void setUp() {
        rateRequest = new FastShipRateRequest();
        rateRequest.setOriginPin("560001");
        rateRequest.setDestinationPin("110001");
        rateRequest.setWeightKg(1.5);
        rateRequest.setPaymentMode("COD");
        rateRequest.setInvoiceValue(new BigDecimal("2500"));

        shipmentRequest = new FastShipShipmentRequest();
        shipmentRequest.setReferenceNumber("ZPY-ORD-10001");
        shipmentRequest.setServiceCode("FAST-AIR");
        shipmentRequest.setCallbackUrl("http://zippy-backend/api/webhooks/fastship");
    }

    @Test
    void shouldReturnFastShipRate() throws Exception {
        mockMvc.perform(post("/fastship/api/v1/rate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(rateRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.service.service_code").value("FAST-AIR"))
                .andExpect(jsonPath("$.service.total_amount").value(182.90));
    }

    @Test
    void shouldReturn500WhenFailParamSetOnRate() throws Exception {
        mockMvc.perform(post("/fastship/api/v1/rate?fail=true")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(rateRequest)))
                .andExpect(status().isInternalServerError());
    }

    @Test
    void shouldCreateFastShipShipment() throws Exception {
        MockShipmentStore.MockShipmentRecord mockRecord = new MockShipmentStore.MockShipmentRecord(
                "FASTSHIP", "FS-700001", "FST123456789", "ZPY-ORD-10001", "FAST-AIR", "BOOKED", "http://cb"
        );
        when(mockShipmentStore.createFastShipment(anyString(), anyString(), anyString())).thenReturn(mockRecord);

        mockMvc.perform(post("/fastship/api/v1/shipments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(shipmentRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.shipment_id").value("FS-700001"))
                .andExpect(jsonPath("$.tracking_number").value("FST123456789"))
                .andExpect(jsonPath("$.status").value("BOOKED"));
    }
}
