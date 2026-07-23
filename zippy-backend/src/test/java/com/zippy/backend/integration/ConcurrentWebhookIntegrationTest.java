package com.zippy.backend.integration;

import com.zippy.backend.model.Order;
import com.zippy.backend.model.Shipment;
import com.zippy.backend.repository.OrderRepository;
import com.zippy.backend.repository.ShipmentEventRepository;
import com.zippy.backend.repository.ShipmentRepository;
import com.zippy.backend.service.WebhookProcessingService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
class ConcurrentWebhookIntegrationTest {

    @Autowired
    private WebhookProcessingService webhookProcessingService;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ShipmentRepository shipmentRepository;

    @Autowired
    private ShipmentEventRepository shipmentEventRepository;

    @BeforeEach
    void setUp() {
        shipmentEventRepository.deleteAll();
        shipmentRepository.deleteAll();
        orderRepository.deleteAll();
    }

    @Test
    void shouldHandleDuplicateWebhooksIdempotently() {
        Order order = new Order();
        order.setZippyOrderId("ZPY-ORD-CONCURRENT");
        order.setMerchantOrderId("CONC-100");
        order.setCustomerName("Concurrent User");
        order.setCustomerPhone("9998887770");
        order.setPickupPincode("560001");
        order.setDeliveryPincode("110001");
        order.setWeightGrams(1000);
        order.setPaymentType("PREPAID");
        order.setOrderStatus("SHIPMENT_CREATED");
        Order savedOrder = orderRepository.save(order);

        Shipment shipment = new Shipment();
        shipment.setOrder(savedOrder);
        shipment.setCarrierCode("FASTSHIP");
        shipment.setCarrierShipmentId("FS-CONC-1");
        shipment.setTrackingNumber("FSTCONCURRENT1");
        shipment.setSelectedServiceCode("FAST-AIR");
        shipment.setQuotedAmount(new BigDecimal("182.90"));
        shipment.setCurrentStatus("SHIPMENT_CREATED");
        shipmentRepository.save(shipment);

        String webhookPayload = """
            {
              "shipment_id": "FS-CONC-1",
              "tracking_number": "FSTCONCURRENT1",
              "event_code": "IN_TRANSIT",
              "event_description": "Concurrent event test",
              "event_time": "2026-07-15T12:00:00Z"
            }
            """;

        // First ingestion -> PROCESSED
        WebhookProcessingService.WebhookResult firstResult = webhookProcessingService.processFastShipWebhook(webhookPayload);
        assertThat(firstResult.status()).isEqualTo("PROCESSED");

        // Second ingestion (Duplicate payload with same idempotency key) -> DUPLICATE_IGNORED
        WebhookProcessingService.WebhookResult secondResult = webhookProcessingService.processFastShipWebhook(webhookPayload);
        assertThat(secondResult.status()).isEqualTo("DUPLICATE_IGNORED");

        // Verify only 1 event is recorded in DB due to idempotency key guard
        long eventCount = shipmentEventRepository.count();
        assertThat(eventCount).isEqualTo(1L);
    }
}
