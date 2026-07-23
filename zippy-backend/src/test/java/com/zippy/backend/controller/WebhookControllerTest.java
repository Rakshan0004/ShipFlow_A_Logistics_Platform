package com.zippy.backend.controller;

import com.zippy.backend.service.WebhookProcessingService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(WebhookController.class)
class WebhookControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private WebhookProcessingService webhookProcessingService;

    @Test
    void shouldReturn200ForFastShipWebhook() throws Exception {
        when(webhookProcessingService.processFastShipWebhook(anyString()))
                .thenReturn(new WebhookProcessingService.WebhookResult("PROCESSED", "Event recorded successfully"));

        mockMvc.perform(post("/api/webhooks/fastship")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"shipment_id\":\"FS-700001\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("PROCESSED"));
    }

    @Test
    void shouldReturn200ForQuickExpressWebhook() throws Exception {
        when(webhookProcessingService.processQuickExpressWebhook(anyString()))
                .thenReturn(new WebhookProcessingService.WebhookResult("PROCESSED", "Event recorded successfully"));

        mockMvc.perform(post("/api/webhooks/quickexpress")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"awb\":\"QE987654321\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("PROCESSED"));
    }

    @Test
    void shouldReturn200ForReliableCourierWebhook() throws Exception {
        when(webhookProcessingService.processReliableWebhook(anyString()))
                .thenReturn(new WebhookProcessingService.WebhookResult("PROCESSED", "Event recorded successfully"));

        mockMvc.perform(post("/api/webhooks/reliable")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"trackingCode\":\"RC1122334455\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("PROCESSED"));
    }
}
