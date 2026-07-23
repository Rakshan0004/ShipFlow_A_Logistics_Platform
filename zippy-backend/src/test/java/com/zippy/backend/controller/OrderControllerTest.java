package com.zippy.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.zippy.backend.dto.*;
import com.zippy.backend.exception.GlobalExceptionHandler;
import com.zippy.backend.exception.OrderNotFoundException;
import com.zippy.backend.service.CarrierSelectionService;
import com.zippy.backend.service.OrderService;
import com.zippy.backend.service.ShipmentService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(OrderController.class)
@Import(GlobalExceptionHandler.class)
class OrderControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private OrderService orderService;

    @MockBean
    private CarrierSelectionService carrierSelectionService;

    @MockBean
    private ShipmentService shipmentService;

    private CreateOrderRequest validRequest;
    private OrderResponse mockResponse;

    @BeforeEach
    void setUp() {
        validRequest = new CreateOrderRequest();
        validRequest.setMerchantOrderId("MERCHANT-10001");
        validRequest.setCustomer(new CustomerDto("Rahul Sharma", "9876543210", "rahul@example.com"));
        validRequest.setPickupAddress(new AddressDto("15 MG Road", "Bengaluru", "Karnataka", "560001"));
        validRequest.setDeliveryAddress(new AddressDto("22 Connaught Place", "New Delhi", "Delhi", "110001"));
        validRequest.setPackageInfo(new PackageDto(1500, 20, 15, 10));
        validRequest.setPaymentType("COD");
        validRequest.setCodAmount(new BigDecimal("2500.00"));

        mockResponse = new OrderResponse();
        mockResponse.setOrderId("ZPY-ORD-10001");
        mockResponse.setMerchantOrderId("MERCHANT-10001");
        mockResponse.setOrderStatus("ORDER_CREATED");
        mockResponse.setCustomer(validRequest.getCustomer());
        mockResponse.setPickupAddress(validRequest.getPickupAddress());
        mockResponse.setDeliveryAddress(validRequest.getDeliveryAddress());
        mockResponse.setPackageInfo(validRequest.getPackageInfo());
        mockResponse.setPaymentType("COD");
        mockResponse.setCodAmount(new BigDecimal("2500.00"));
    }

    @Test
    void shouldReturn201OnValidOrderCreation() throws Exception {
        when(orderService.createOrder(any(CreateOrderRequest.class))).thenReturn(mockResponse);

        mockMvc.perform(post("/api/orders")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.orderId").value("ZPY-ORD-10001"))
                .andExpect(jsonPath("$.merchantOrderId").value("MERCHANT-10001"))
                .andExpect(jsonPath("$.orderStatus").value("ORDER_CREATED"));
    }

    @Test
    void shouldReturn400OnInvalidOrder() throws Exception {
        validRequest.setMerchantOrderId(""); // Blank merchant order ID triggers validation error

        mockMvc.perform(post("/api/orders")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("VALIDATION_ERROR"))
                .andExpect(jsonPath("$.details.merchantOrderId").exists());
    }

    @Test
    void shouldReturn404ForUnknownOrderId() throws Exception {
        when(orderService.getOrder("ZPY-ORD-99999")).thenThrow(new OrderNotFoundException("ZPY-ORD-99999"));

        mockMvc.perform(get("/api/orders/ZPY-ORD-99999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("NOT_FOUND"))
                .andExpect(jsonPath("$.message").value("Order not found: ZPY-ORD-99999"));
    }

    @Test
    void shouldSelectCarrierSuccessfully() throws Exception {
        SelectCarrierRequest selectRequest = new SelectCarrierRequest("FASTSHIP", "FAST-AIR", new BigDecimal("182.90"));
        SelectCarrierResponse selectResponse = new SelectCarrierResponse("ZPY-ORD-10001", "CARRIER_SELECTED",
                new SelectCarrierResponse.SelectedCarrierDetail("FASTSHIP", "FAST-AIR", "FastShip Air Express", new BigDecimal("182.90"), null));

        when(carrierSelectionService.selectCarrier(any(), any())).thenReturn(selectResponse);

        mockMvc.perform(post("/api/orders/ZPY-ORD-10001/select-carrier")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(selectRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.orderId").value("ZPY-ORD-10001"))
                .andExpect(jsonPath("$.orderStatus").value("CARRIER_SELECTED"));
    }

    @Test
    void shouldCreateShipmentSuccessfully() throws Exception {
        ShipmentResponse shipmentResponse = new ShipmentResponse("ZPY-ORD-10001", "SHIPMENT_CREATED",
                new ShipmentResponse.ShipmentDetail("FASTSHIP", "FS-700001", "FST123456789", "FAST-AIR", new BigDecimal("182.90"), "SHIPMENT_CREATED", null));

        when(shipmentService.createShipment("ZPY-ORD-10001")).thenReturn(shipmentResponse);

        mockMvc.perform(post("/api/orders/ZPY-ORD-10001/create-shipment"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.orderId").value("ZPY-ORD-10001"))
                .andExpect(jsonPath("$.orderStatus").value("SHIPMENT_CREATED"))
                .andExpect(jsonPath("$.shipment.trackingNumber").value("FST123456789"));
    }
}

