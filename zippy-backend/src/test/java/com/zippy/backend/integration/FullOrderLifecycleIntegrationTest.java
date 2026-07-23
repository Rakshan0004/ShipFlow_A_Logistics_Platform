package com.zippy.backend.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.zippy.backend.dto.*;
import com.zippy.backend.model.Order;
import com.zippy.backend.model.Shipment;
import com.zippy.backend.repository.OrderRepository;
import com.zippy.backend.repository.ShipmentEventRepository;
import com.zippy.backend.repository.ShipmentRepository;
import com.zippy.backend.repository.ShippingQuoteRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class FullOrderLifecycleIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ShippingQuoteRepository shippingQuoteRepository;

    @Autowired
    private ShipmentRepository shipmentRepository;

    @Autowired
    private ShipmentEventRepository shipmentEventRepository;

    @BeforeEach
    void setUp() {
        shipmentEventRepository.deleteAll();
        shipmentRepository.deleteAll();
        shippingQuoteRepository.deleteAll();
        orderRepository.deleteAll();
    }

    @Test
    void shouldExecuteFullOrderLifecycleSuccessfully() throws Exception {
        // Step 1: Create Order
        CreateOrderRequest createRequest = new CreateOrderRequest();
        createRequest.setMerchantOrderId("MERCHANT-INT-100");
        createRequest.setCustomer(new CustomerDto("Integration Test User", "9998887770", "test@zippy.ai"));
        createRequest.setPickupAddress(new AddressDto("100 Indiranagar", "Bengaluru", "Karnataka", "560038"));
        createRequest.setDeliveryAddress(new AddressDto("500 Connaught Place", "New Delhi", "Delhi", "110001"));
        createRequest.setPackageInfo(new PackageDto(1200, 20, 15, 10));
        createRequest.setPaymentType("COD");
        createRequest.setCodAmount(new BigDecimal("1500.00"));

        String orderResultJson = mockMvc.perform(post("/api/orders")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.orderId").exists())
                .andExpect(jsonPath("$.orderStatus").value("ORDER_CREATED"))
                .andReturn().getResponse().getContentAsString();

        OrderResponse orderResponse = objectMapper.readValue(orderResultJson, OrderResponse.class);
        String zippyOrderId = orderResponse.getOrderId();

        // Step 2: Rate Aggregation (Mocking client responses or database quotes)
        Order savedOrder = orderRepository.findByZippyOrderId(zippyOrderId).orElseThrow();
        mockMvc.perform(get("/api/orders/" + zippyOrderId + "/rates"))
                .andExpect(status().isNotFound()); // No cached quotes yet before POST

        // Step 3: Select Carrier
        // Manually insert a quote to test selection logic deterministically
        com.zippy.backend.model.ShippingQuote quote = new com.zippy.backend.model.ShippingQuote();
        quote.setOrder(savedOrder);
        quote.setCarrierCode("FASTSHIP");
        quote.setServiceCode("FAST-AIR");
        quote.setServiceName("FastShip Air Express");
        quote.setBaseCharge(new BigDecimal("120.00"));
        quote.setCodCharge(new BigDecimal("35.00"));
        quote.setAdditionalCharges(BigDecimal.ZERO);
        quote.setTax(new BigDecimal("27.90"));
        quote.setTotalCharge(new BigDecimal("182.90"));
        quote.setEstimatedMinDays(2);
        quote.setEstimatedMaxDays(2);
        shippingQuoteRepository.save(quote);

        SelectCarrierRequest selectRequest = new SelectCarrierRequest("FASTSHIP", "FAST-AIR", new BigDecimal("182.90"));
        mockMvc.perform(post("/api/orders/" + zippyOrderId + "/select-carrier")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(selectRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.orderStatus").value("CARRIER_SELECTED"));

        // Step 4: Webhook Event Processing (Simulate FastShip Webhook)
        // Manually create shipment to test tracking & webhook
        Shipment shipment = new Shipment();
        shipment.setOrder(savedOrder);
        shipment.setCarrierCode("FASTSHIP");
        shipment.setCarrierShipmentId("FS-700001");
        shipment.setTrackingNumber("FST123456789");
        shipment.setSelectedServiceCode("FAST-AIR");
        shipment.setQuotedAmount(new BigDecimal("182.90"));
        shipment.setCurrentStatus("SHIPMENT_CREATED");
        shipmentRepository.save(shipment);

        String webhookPayload = """
            {
              "shipment_id": "FS-700001",
              "tracking_number": "FST123456789",
              "event_code": "IN_TRANSIT",
              "event_description": "Shipment departed Bengaluru hub",
              "event_time": "2026-07-15T10:30:00Z",
              "location": "Bengaluru Hub"
            }
            """;

        mockMvc.perform(post("/api/webhooks/fastship")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(webhookPayload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("PROCESSED"));

        // Step 5: Get Order Tracking History
        mockMvc.perform(get("/api/orders/" + zippyOrderId + "/tracking"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.orderId").value(zippyOrderId))
                .andExpect(jsonPath("$.orderStatus").value("IN_TRANSIT"))
                .andExpect(jsonPath("$.shipment.trackingNumber").value("FST123456789"))
                .andExpect(jsonPath("$.eventHistory.length()").value(1))
                .andExpect(jsonPath("$.eventHistory[0].normalizedStatus").value("IN_TRANSIT"));
    }
}
