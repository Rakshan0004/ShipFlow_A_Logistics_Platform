package com.zippy.mockcourier.reliable;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.zippy.mockcourier.common.MockShipmentStore;
import com.zippy.mockcourier.reliable.dto.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ReliableCourierController.class)
class ReliableCourierControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private MockShipmentStore mockShipmentStore;

    private ReliableCourierShipmentRequest shipmentRequest;

    @BeforeEach
    void setUp() {
        shipmentRequest = new ReliableCourierShipmentRequest();
        shipmentRequest.setOrderReference("ZPY-ORD-10001");
        shipmentRequest.setSelectedOption("RC-SURFACE");
        shipmentRequest.setStatusNotificationUrl("http://zippy-backend/api/webhooks/reliable");
    }

    @Test
    void shouldReturnReliableCourierShippingOptions() throws Exception {
        mockMvc.perform(get("/reliablecourier/shipping-options?from=560001&to=110001&weight=1500&cod=true&amount=2500"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.length()").value(2))
                .andExpect(jsonPath("$.data[0].id").value("RC-SURFACE"))
                .andExpect(jsonPath("$.data[1].id").value("RC-AIR"));
    }

    @Test
    void shouldCreateReliableCourierOrderOnPut() throws Exception {
        MockShipmentStore.MockShipmentRecord mockRecord = new MockShipmentStore.MockShipmentRecord(
                "RELIABLE", "RC-DO-600001", "RC1122334455", "ZPY-ORD-10001", "RC-SURFACE", "SHIPMENT_CREATED", "http://cb"
        );
        when(mockShipmentStore.createReliableShipment(any(), any(), any())).thenReturn(mockRecord);

        mockMvc.perform(put("/reliablecourier/orders")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(shipmentRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.result").value("ACCEPTED"))
                .andExpect(jsonPath("$.deliveryOrder.id").value("RC-DO-600001"))
                .andExpect(jsonPath("$.deliveryOrder.trackingCode").value("RC1122334455"));
    }
}
