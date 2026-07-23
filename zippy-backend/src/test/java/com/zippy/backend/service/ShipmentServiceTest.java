package com.zippy.backend.service;

import com.zippy.backend.adapter.CourierClient;
import com.zippy.backend.dto.ShipmentCreationResult;
import com.zippy.backend.dto.ShipmentResponse;
import com.zippy.backend.exception.CourierShipmentCreationException;
import com.zippy.backend.exception.IllegalStateTransitionException;
import com.zippy.backend.exception.OrderNotFoundException;
import com.zippy.backend.exception.ValidationException;
import com.zippy.backend.model.Order;
import com.zippy.backend.model.Shipment;
import com.zippy.backend.model.ShippingQuote;
import com.zippy.backend.repository.OrderRepository;
import com.zippy.backend.repository.ShipmentRepository;
import com.zippy.backend.repository.ShippingQuoteRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ShipmentServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private ShippingQuoteRepository shippingQuoteRepository;

    @Mock
    private ShipmentRepository shipmentRepository;

    @Mock
    private CourierClient fastShipClient;

    private ShipmentService shipmentService;
    private Order testOrder;
    private ShippingQuote testQuote;

    @BeforeEach
    void setUp() {
        lenient().when(fastShipClient.getCarrierCode()).thenReturn("FASTSHIP");

        shipmentService = new ShipmentService(
                orderRepository,
                shippingQuoteRepository,
                shipmentRepository,
                List.of(fastShipClient)
        );

        testOrder = new Order();
        testOrder.setId(1L);
        testOrder.setZippyOrderId("ZPY-ORD-10001");
        testOrder.setOrderStatus("CARRIER_SELECTED");

        testQuote = new ShippingQuote();
        testQuote.setId(10L);
        testQuote.setOrder(testOrder);
        testQuote.setCarrierCode("FASTSHIP");
        testQuote.setServiceCode("FAST-AIR");
        testQuote.setTotalCharge(new BigDecimal("182.90"));
    }

    @Test
    void shouldCreateShipmentSuccessfully() {
        ShipmentCreationResult creationResult = new ShipmentCreationResult(
                "FASTSHIP", "FS-700001", "FST123456789", "http://label.pdf", "BOOKED"
        );

        when(orderRepository.findByZippyOrderId("ZPY-ORD-10001")).thenReturn(Optional.of(testOrder));
        when(shippingQuoteRepository.findByOrderId(1L)).thenReturn(List.of(testQuote));
        when(fastShipClient.createShipment(testOrder, testQuote)).thenReturn(creationResult);
        when(shipmentRepository.save(any(Shipment.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ShipmentResponse response = shipmentService.createShipment("ZPY-ORD-10001");

        assertThat(response).isNotNull();
        assertThat(response.getOrderId()).isEqualTo("ZPY-ORD-10001");
        assertThat(response.getOrderStatus()).isEqualTo("SHIPMENT_CREATED");
        assertThat(response.getShipment().getCarrierShipmentId()).isEqualTo("FS-700001");
        assertThat(response.getShipment().getTrackingNumber()).isEqualTo("FST123456789");
    }

    @Test
    void shouldRejectShipmentWhenCarrierNotSelected() {
        testOrder.setOrderStatus("ORDER_CREATED");
        when(orderRepository.findByZippyOrderId("ZPY-ORD-10001")).thenReturn(Optional.of(testOrder));

        assertThatThrownBy(() -> shipmentService.createShipment("ZPY-ORD-10001"))
                .isInstanceOf(ValidationException.class);
    }

    @Test
    void shouldRejectShipmentWhenShipmentAlreadyExists() {
        testOrder.setOrderStatus("SHIPMENT_CREATED");
        Shipment existingShipment = new Shipment();
        existingShipment.setId(99L);

        when(orderRepository.findByZippyOrderId("ZPY-ORD-10001")).thenReturn(Optional.of(testOrder));
        when(shipmentRepository.findByOrderId(1L)).thenReturn(Optional.of(existingShipment));

        assertThatThrownBy(() -> shipmentService.createShipment("ZPY-ORD-10001"))
                .isInstanceOf(IllegalStateTransitionException.class);
    }

    @Test
    void shouldThrowCourierShipmentCreationExceptionOnCourierFailure() {
        when(orderRepository.findByZippyOrderId("ZPY-ORD-10001")).thenReturn(Optional.of(testOrder));
        when(shippingQuoteRepository.findByOrderId(1L)).thenReturn(List.of(testQuote));
        when(fastShipClient.createShipment(testOrder, testQuote)).thenThrow(new RuntimeException("API Connection Refused"));

        assertThatThrownBy(() -> shipmentService.createShipment("ZPY-ORD-10001"))
                .isInstanceOf(CourierShipmentCreationException.class);
    }
}
