package com.zippy.backend.service;

import com.zippy.backend.adapter.CourierClient;
import com.zippy.backend.dto.NormalizedShippingOption;
import com.zippy.backend.dto.RateResponse;
import com.zippy.backend.exception.CourierUnavailableException;
import com.zippy.backend.exception.OrderNotFoundException;
import com.zippy.backend.model.Order;
import com.zippy.backend.model.ShippingQuote;
import com.zippy.backend.repository.OrderRepository;
import com.zippy.backend.repository.ShippingQuoteRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RateAggregationServiceTest {

    @Mock
    private CourierClient fastShipClient;

    @Mock
    private CourierClient quickExpressClient;

    @Mock
    private CourierClient reliableCourierClient;

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private ShippingQuoteRepository shippingQuoteRepository;

    private RateAggregationService rateAggregationService;
    private Order testOrder;
    private NormalizedShippingOption fastShipOption;
    private NormalizedShippingOption quickExpressOption;
    private NormalizedShippingOption reliableOption1;
    private NormalizedShippingOption reliableOption2;

    @BeforeEach
    void setUp() {
        lenient().when(fastShipClient.getCarrierCode()).thenReturn("FASTSHIP");
        lenient().when(fastShipClient.getCarrierName()).thenReturn("FastShip");

        lenient().when(quickExpressClient.getCarrierCode()).thenReturn("QUICKEXPRESS");
        lenient().when(quickExpressClient.getCarrierName()).thenReturn("QuickExpress");

        lenient().when(reliableCourierClient.getCarrierCode()).thenReturn("RELIABLE");
        lenient().when(reliableCourierClient.getCarrierName()).thenReturn("ReliableCourier");

        List<CourierClient> clients = List.of(fastShipClient, quickExpressClient, reliableCourierClient);
        rateAggregationService = new RateAggregationService(clients, orderRepository, shippingQuoteRepository);

        testOrder = new Order();
        testOrder.setId(1L);
        testOrder.setZippyOrderId("ZPY-ORD-10001");
        testOrder.setMerchantOrderId("MERCHANT-10001");

        fastShipOption = new NormalizedShippingOption(
                "FASTSHIP", "FastShip", "FAST-AIR", "FastShip Air Express",
                new BigDecimal("120.00"), new BigDecimal("35.00"), BigDecimal.ZERO,
                new BigDecimal("27.90"), new BigDecimal("182.90"), 2, 2
        );

        quickExpressOption = new NormalizedShippingOption(
                "QUICKEXPRESS", "QuickExpress", "EXPRESS", "QuickExpress Express",
                new BigDecimal("115.00"), new BigDecimal("40.00"), new BigDecimal("12.00"),
                new BigDecimal("30.06"), new BigDecimal("197.06"), 2, 3
        );

        reliableOption1 = new NormalizedShippingOption(
                "RELIABLE", "ReliableCourier", "RC-SURFACE", "Reliable Surface",
                new BigDecimal("95.00"), new BigDecimal("30.00"), new BigDecimal("10.00"),
                new BigDecimal("24.30"), new BigDecimal("159.30"), 4, 5
        );

        reliableOption2 = new NormalizedShippingOption(
                "RELIABLE", "ReliableCourier", "RC-AIR", "Reliable Air",
                new BigDecimal("130.00"), new BigDecimal("30.00"), new BigDecimal("12.00"),
                new BigDecimal("30.96"), new BigDecimal("202.96"), 2, 3
        );
    }

    @Test
    void shouldAggregateRatesFromAllCouriers() {
        when(orderRepository.findByZippyOrderId("ZPY-ORD-10001")).thenReturn(Optional.of(testOrder));
        when(fastShipClient.getRates(testOrder)).thenReturn(List.of(fastShipOption));
        when(quickExpressClient.getRates(testOrder)).thenReturn(List.of(quickExpressOption));
        when(reliableCourierClient.getRates(testOrder)).thenReturn(List.of(reliableOption1, reliableOption2));

        RateResponse response = rateAggregationService.fetchAndAggregateRates("ZPY-ORD-10001", null);

        assertThat(response).isNotNull();
        assertThat(response.getOrderId()).isEqualTo("ZPY-ORD-10001");
        assertThat(response.getShippingOptions()).hasSize(4);
        assertThat(response.getWarnings()).isEmpty();
        verify(shippingQuoteRepository, times(4)).save(any(ShippingQuote.class));
    }

    @Test
    void shouldReturnPartialRatesWhenOneCourierFails() {
        when(orderRepository.findByZippyOrderId("ZPY-ORD-10001")).thenReturn(Optional.of(testOrder));
        when(fastShipClient.getRates(testOrder)).thenReturn(List.of(fastShipOption));
        when(quickExpressClient.getRates(testOrder)).thenThrow(new CourierUnavailableException("QUICKEXPRESS", "HTTP 500"));
        when(reliableCourierClient.getRates(testOrder)).thenReturn(List.of(reliableOption1, reliableOption2));

        RateResponse response = rateAggregationService.fetchAndAggregateRates("ZPY-ORD-10001", null);

        assertThat(response).isNotNull();
        assertThat(response.getShippingOptions()).hasSize(3);
        assertThat(response.getWarnings()).hasSize(1);
        assertThat(response.getWarnings().get(0).getCarrierCode()).isEqualTo("QUICKEXPRESS");
    }

    @Test
    void shouldReturnEmptyOptionsWhenAllCouriersFail() {
        when(orderRepository.findByZippyOrderId("ZPY-ORD-10001")).thenReturn(Optional.of(testOrder));
        when(fastShipClient.getRates(testOrder)).thenThrow(new CourierUnavailableException("FASTSHIP", "500"));
        when(quickExpressClient.getRates(testOrder)).thenThrow(new CourierUnavailableException("QUICKEXPRESS", "500"));
        when(reliableCourierClient.getRates(testOrder)).thenThrow(new CourierUnavailableException("RELIABLE", "500"));

        RateResponse response = rateAggregationService.fetchAndAggregateRates("ZPY-ORD-10001", null);

        assertThat(response).isNotNull();
        assertThat(response.getShippingOptions()).isEmpty();
        assertThat(response.getWarnings()).hasSize(3);
    }

    @Test
    void shouldSortRatesByTotalCharge() {
        List<NormalizedShippingOption> options = new ArrayList<>(List.of(quickExpressOption, fastShipOption, reliableOption1, reliableOption2));
        rateAggregationService.sortOptions(options, "price");

        assertThat(options.get(0).getCarrierCode()).isEqualTo("RELIABLE"); // 159.30
        assertThat(options.get(1).getCarrierCode()).isEqualTo("FASTSHIP"); // 182.90
        assertThat(options.get(2).getCarrierCode()).isEqualTo("QUICKEXPRESS"); // 197.06
        assertThat(options.get(3).getCarrierCode()).isEqualTo("RELIABLE"); // 202.96
    }

    @Test
    void shouldSortRatesByEstimatedDelivery() {
        List<NormalizedShippingOption> options = new ArrayList<>(List.of(reliableOption1, fastShipOption, quickExpressOption, reliableOption2));
        rateAggregationService.sortOptions(options, "speed");

        assertThat(options.get(0).getEstimatedMinDays()).isEqualTo(2);
        assertThat(options.get(0).getEstimatedMaxDays()).isEqualTo(2); // FastShip (2-2)
    }

    @Test
    void shouldThrow404ForUnknownOrder() {
        when(orderRepository.findByZippyOrderId("ZPY-ORD-99999")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> rateAggregationService.fetchAndAggregateRates("ZPY-ORD-99999", null))
                .isInstanceOf(OrderNotFoundException.class);
    }
}
