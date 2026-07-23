package com.zippy.mockcourier.quickexpress;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.zippy.mockcourier.common.MockShipmentStore;
import com.zippy.mockcourier.quickexpress.dto.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(QuickExpressController.class)
class QuickExpressControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private MockShipmentStore mockShipmentStore;

    private QuickExpressRateRequest rateRequest;
    private QuickExpressShipmentRequest shipmentRequest;

    @BeforeEach
    void setUp() {
        rateRequest = new QuickExpressRateRequest();
        rateRequest.setPickupPincode("560001");
        rateRequest.setDeliveryPincode("110001");
        rateRequest.setWeightInGrams(1500);

        shipmentRequest = new QuickExpressShipmentRequest();
        shipmentRequest.setClientOrderId("ZPY-ORD-10001");
        shipmentRequest.setQuoteId("QE-Q-90001");
        shipmentRequest.setProductType("EXPRESS");
        shipmentRequest.setWebhook("http://zippy-backend/api/webhooks/quickexpress");
    }

    @Test
    void shouldReturnQuickExpressRate() throws Exception {
        when(mockShipmentStore.generateQuickExpressQuoteId()).thenReturn("QE-Q-90001");

        mockMvc.perform(post("/quickexpress/rates/check")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(rateRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("AVAILABLE"))
                .andExpect(jsonPath("$.quoteId").value("QE-Q-90001"))
                .andExpect(jsonPath("$.payable").value(197.06))
                .andExpect(jsonPath("$.product").value("EXPRESS"));
    }

    @Test
    void shouldCreateQuickExpressBooking() throws Exception {
        MockShipmentStore.MockShipmentRecord mockRecord = new MockShipmentStore.MockShipmentRecord(
                "QUICKEXPRESS", "QE-B-800001", "QE987654321", "ZPY-ORD-10001", "EXPRESS", "SHIPMENT_CREATED", "http://cb"
        );
        when(mockShipmentStore.createQuickExpressShipment(any(), any(), any())).thenReturn(mockRecord);

        mockMvc.perform(post("/quickexpress/booking/create")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(shipmentRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.bookingStatus").value("CONFIRMED"))
                .andExpect(jsonPath("$.booking.bookingId").value("QE-B-800001"))
                .andExpect(jsonPath("$.booking.awb").value("QE987654321"));
    }
}
