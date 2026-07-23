package com.zippy.backend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.zippy.backend.model.Order;
import com.zippy.backend.model.Shipment;
import com.zippy.backend.model.ShipmentEvent;
import com.zippy.backend.repository.OrderRepository;
import com.zippy.backend.repository.ShipmentEventRepository;
import com.zippy.backend.repository.ShipmentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataIntegrityViolationException;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class WebhookProcessingServiceTest {

    @Mock
    private ShipmentRepository shipmentRepository;

    @Mock
    private ShipmentEventRepository shipmentEventRepository;

    @Mock
    private OrderRepository orderRepository;

    @Spy
    private StatusNormalizationService statusNormalizationService = new StatusNormalizationService();

    @Spy
    private ObjectMapper objectMapper = new ObjectMapper();

    @InjectMocks
    private WebhookProcessingService webhookProcessingService;

    private Shipment testShipment;
    private Order testOrder;

    @BeforeEach
    void setUp() {
        testOrder = new Order();
        testOrder.setId(1L);
        testOrder.setZippyOrderId("ZPY-ORD-10001");
        testOrder.setOrderStatus("SHIPMENT_CREATED");

        testShipment = new Shipment();
        testShipment.setId(10L);
        testShipment.setOrder(testOrder);
        testShipment.setCarrierCode("FASTSHIP");
        testShipment.setCarrierShipmentId("FS-700001");
        testShipment.setTrackingNumber("FST123456789");
        testShipment.setCurrentStatus("SHIPMENT_CREATED");
    }

    @Test
    void shouldProcessFastShipWebhookSuccessfully() {
        String payload = """
            {
              "shipment_id": "FS-700001",
              "tracking_number": "FST123456789",
              "event_code": "IN_TRANSIT",
              "event_description": "Shipment departed hub",
              "event_time": "2026-07-15T10:30:00Z",
              "location": "Bengaluru Hub"
            }
            """;

        when(shipmentRepository.findByTrackingNumber("FST123456789")).thenReturn(Optional.of(testShipment));

        WebhookProcessingService.WebhookResult result = webhookProcessingService.processFastShipWebhook(payload);

        assertThat(result.status()).isEqualTo("PROCESSED");
        verify(shipmentEventRepository).saveAndFlush(any(ShipmentEvent.class));
        assertThat(testShipment.getCurrentStatus()).isEqualTo("IN_TRANSIT");
        assertThat(testOrder.getOrderStatus()).isEqualTo("IN_TRANSIT");
    }

    @Test
    void shouldProcessQuickExpressWebhookSuccessfully() {
        testShipment.setCarrierCode("QUICKEXPRESS");
        testShipment.setTrackingNumber("QE987654321");

        String payload = """
            {
              "awb": "QE987654321",
              "event": {
                "type": "OFD",
                "message": "Out for delivery",
                "occurredAt": "2026-07-17T08:15:00Z"
              },
              "facility": { "city": "New Delhi", "code": "DEL-01" }
            }
            """;

        when(shipmentRepository.findByTrackingNumber("QE987654321")).thenReturn(Optional.of(testShipment));

        WebhookProcessingService.WebhookResult result = webhookProcessingService.processQuickExpressWebhook(payload);

        assertThat(result.status()).isEqualTo("PROCESSED");
        assertThat(testShipment.getCurrentStatus()).isEqualTo("OUT_FOR_DELIVERY");
    }

    @Test
    void shouldProcessReliableCourierWebhookSuccessfully() {
        testShipment.setCarrierCode("RELIABLE");
        testShipment.setTrackingNumber("RC1122334455");

        String payload = """
            {
              "trackingCode": "RC1122334455",
              "statusId": 50,
              "statusText": "Delivered",
              "updatedOn": "2026-07-19T15:45:00Z",
              "proofOfDelivery": { "receivedBy": "Rahul Sharma", "deliveryLocation": "New Delhi" }
            }
            """;

        when(shipmentRepository.findByTrackingNumber("RC1122334455")).thenReturn(Optional.of(testShipment));

        WebhookProcessingService.WebhookResult result = webhookProcessingService.processReliableWebhook(payload);

        assertThat(result.status()).isEqualTo("PROCESSED");
        assertThat(testShipment.getCurrentStatus()).isEqualTo("DELIVERED");
    }

    @Test
    void shouldIgnoreWebhookForUnknownTrackingNumber() {
        String payload = """
            {
              "shipment_id": "FS-UNKNOWN",
              "tracking_number": "FST999999999",
              "event_code": "IN_TRANSIT"
            }
            """;

        when(shipmentRepository.findByTrackingNumber("FST999999999")).thenReturn(Optional.empty());

        WebhookProcessingService.WebhookResult result = webhookProcessingService.processFastShipWebhook(payload);

        assertThat(result.status()).isEqualTo("IGNORED");
        assertThat(result.message()).isEqualTo("UNKNOWN_SHIPMENT");
        verify(shipmentEventRepository, never()).saveAndFlush(any());
    }

    @Test
    void shouldHandleDuplicateWebhookIdempotently() {
        String payload = """
            {
              "shipment_id": "FS-700001",
              "tracking_number": "FST123456789",
              "event_code": "IN_TRANSIT"
            }
            """;

        when(shipmentRepository.findByTrackingNumber("FST123456789")).thenReturn(Optional.of(testShipment));
        when(shipmentEventRepository.saveAndFlush(any())).thenThrow(new DataIntegrityViolationException("Unique constraint violation"));

        WebhookProcessingService.WebhookResult result = webhookProcessingService.processFastShipWebhook(payload);

        assertThat(result.status()).isEqualTo("DUPLICATE_IGNORED");
    }

    @Test
    void shouldRejectInvalidStatusTransition() {
        testShipment.setCurrentStatus("DELIVERED");

        String payload = """
            {
              "shipment_id": "FS-700001",
              "tracking_number": "FST123456789",
              "event_code": "IN_TRANSIT"
            }
            """;

        when(shipmentRepository.findByTrackingNumber("FST123456789")).thenReturn(Optional.of(testShipment));

        WebhookProcessingService.WebhookResult result = webhookProcessingService.processFastShipWebhook(payload);

        assertThat(result.status()).isEqualTo("REJECTED_INVALID_TRANSITION");
        assertThat(testShipment.getCurrentStatus()).isEqualTo("DELIVERED"); // Status untouched
        verify(shipmentEventRepository, never()).saveAndFlush(any());
    }
}
