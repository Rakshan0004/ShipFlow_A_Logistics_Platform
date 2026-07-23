package com.zippy.backend.service;

import com.zippy.backend.dto.SelectCarrierRequest;
import com.zippy.backend.dto.SelectCarrierResponse;
import com.zippy.backend.exception.IllegalStateTransitionException;
import com.zippy.backend.exception.OrderNotFoundException;
import com.zippy.backend.exception.PriceMismatchException;
import com.zippy.backend.exception.ValidationException;
import com.zippy.backend.model.Order;
import com.zippy.backend.model.ShippingQuote;
import com.zippy.backend.repository.OrderRepository;
import com.zippy.backend.repository.ShippingQuoteRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CarrierSelectionServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private ShippingQuoteRepository shippingQuoteRepository;

    @InjectMocks
    private CarrierSelectionService carrierSelectionService;

    private Order testOrder;
    private ShippingQuote testQuote;
    private SelectCarrierRequest validRequest;

    @BeforeEach
    void setUp() {
        testOrder = new Order();
        testOrder.setId(1L);
        testOrder.setZippyOrderId("ZPY-ORD-10001");
        testOrder.setOrderStatus("ORDER_CREATED");

        testQuote = new ShippingQuote();
        testQuote.setId(10L);
        testQuote.setOrder(testOrder);
        testQuote.setCarrierCode("FASTSHIP");
        testQuote.setServiceCode("FAST-AIR");
        testQuote.setServiceName("FastShip Air Express");
        testQuote.setTotalCharge(new BigDecimal("182.90"));

        validRequest = new SelectCarrierRequest("FASTSHIP", "FAST-AIR", new BigDecimal("182.90"));
    }

    @Test
    void shouldSelectCarrierSuccessfully() {
        when(orderRepository.findByZippyOrderId("ZPY-ORD-10001")).thenReturn(Optional.of(testOrder));
        when(shippingQuoteRepository.findByOrderId(1L)).thenReturn(List.of(testQuote));
        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> invocation.getArgument(0));

        SelectCarrierResponse response = carrierSelectionService.selectCarrier("ZPY-ORD-10001", validRequest);

        assertThat(response).isNotNull();
        assertThat(response.getOrderId()).isEqualTo("ZPY-ORD-10001");
        assertThat(response.getOrderStatus()).isEqualTo("CARRIER_SELECTED");
        assertThat(response.getSelectedCarrier().getCarrierCode()).isEqualTo("FASTSHIP");
        assertThat(response.getSelectedCarrier().getQuotedAmount()).isEqualTo(new BigDecimal("182.90"));
    }

    @Test
    void shouldRejectSelectionWhenOrderNotFound() {
        when(orderRepository.findByZippyOrderId("ZPY-ORD-99999")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> carrierSelectionService.selectCarrier("ZPY-ORD-99999", validRequest))
                .isInstanceOf(OrderNotFoundException.class);
    }

    @Test
    void shouldRejectSelectionWhenQuoteNotFound() {
        when(orderRepository.findByZippyOrderId("ZPY-ORD-10001")).thenReturn(Optional.of(testOrder));
        when(shippingQuoteRepository.findByOrderId(1L)).thenReturn(List.of());

        assertThatThrownBy(() -> carrierSelectionService.selectCarrier("ZPY-ORD-10001", validRequest))
                .isInstanceOf(ValidationException.class);
    }

    @Test
    void shouldRejectSelectionWhenPriceMismatched() {
        SelectCarrierRequest tamperedRequest = new SelectCarrierRequest("FASTSHIP", "FAST-AIR", new BigDecimal("100.00"));

        when(orderRepository.findByZippyOrderId("ZPY-ORD-10001")).thenReturn(Optional.of(testOrder));
        when(shippingQuoteRepository.findByOrderId(1L)).thenReturn(List.of(testQuote));

        assertThatThrownBy(() -> carrierSelectionService.selectCarrier("ZPY-ORD-10001", tamperedRequest))
                .isInstanceOf(PriceMismatchException.class);
    }

    @Test
    void shouldRejectSelectionWhenShipmentAlreadyCreated() {
        testOrder.setOrderStatus("SHIPMENT_CREATED");
        when(orderRepository.findByZippyOrderId("ZPY-ORD-10001")).thenReturn(Optional.of(testOrder));

        assertThatThrownBy(() -> carrierSelectionService.selectCarrier("ZPY-ORD-10001", validRequest))
                .isInstanceOf(IllegalStateTransitionException.class);
    }
}
