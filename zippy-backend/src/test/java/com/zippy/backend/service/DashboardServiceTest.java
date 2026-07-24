package com.zippy.backend.service;

import com.zippy.backend.dto.response.DashboardStatsResponse;
import com.zippy.backend.dto.response.RecentOrderResponse;
import com.zippy.backend.dto.response.RecentOrdersResponse;
import com.zippy.backend.model.Order;
import com.zippy.backend.model.Shipment;
import com.zippy.backend.repository.OrderRepository;
import com.zippy.backend.repository.ShipmentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DashboardServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private ShipmentRepository shipmentRepository;

    @InjectMocks
    private DashboardService dashboardService;

    private List<Order> testOrders;
    private List<Shipment> testShipments;

    @BeforeEach
    void setUp() {
        // Create test orders
        Order order1 = createOrder("ZPY-ORD-10001", "MERCHANT-10001", "Rahul Sharma", "DELIVERED", BigDecimal.valueOf(500.00), Instant.now());
        Order order2 = createOrder("ZPY-ORD-10002", "MERCHANT-10002", "Priya Verma", "IN_TRANSIT", BigDecimal.valueOf(750.00), Instant.now().minus(1, ChronoUnit.DAYS));
        Order order3 = createOrder("ZPY-ORD-10003", "MERCHANT-10003", "Amit Kumar", "DELIVERED", BigDecimal.valueOf(1000.00), Instant.now());
        Order order4 = createOrder("ZPY-ORD-10004", "MERCHANT-10004", "Sneha Patel", "ORDER_CREATED", null, Instant.now().minus(2, ChronoUnit.DAYS));
        Order order5 = createOrder("ZPY-ORD-10005", "MERCHANT-10005", "Vikram Singh", "CANCELLED", null, Instant.now().minus(3, ChronoUnit.DAYS));

        testOrders = Arrays.asList(order1, order2, order3, order4, order5);

        // Create test shipments
        Shipment shipment1 = createShipment(order1, "FASTSHIP", "FST123", "DELIVERED");
        Shipment shipment2 = createShipment(order2, "QUICKEXPRESS", "QEX456", "IN_TRANSIT");
        Shipment shipment3 = createShipment(order3, "RELIABLE", "REL789", "DELIVERED");

        testShipments = Arrays.asList(shipment1, shipment2, shipment3);
    }

    private Order createOrder(String zippyOrderId, String merchantOrderId, String customerName, 
                             String orderStatus, BigDecimal codAmount, Instant createdAt) {
        Order order = new Order();
        order.setZippyOrderId(zippyOrderId);
        order.setMerchantOrderId(merchantOrderId);
        order.setCustomerName(customerName);
        order.setOrderStatus(orderStatus);
        order.setCodAmount(codAmount);
        order.setCreatedAt(createdAt);
        order.setUpdatedAt(createdAt);
        order.setDeliveryCity("Mumbai");
        order.setPickupPincode("400001");
        order.setDeliveryPincode("110001");
        order.setWeightGrams(1000);
        order.setPaymentType("COD");
        order.setCustomerPhone("9876543210");
        return order;
    }

    private Shipment createShipment(Order order, String carrierCode, String trackingNumber, String currentStatus) {
        Shipment shipment = new Shipment();
        shipment.setOrder(order);
        shipment.setCarrierCode(carrierCode);
        shipment.setTrackingNumber(trackingNumber);
        shipment.setCurrentStatus(currentStatus);
        shipment.setSelectedServiceCode("STANDARD");
        shipment.setQuotedAmount(BigDecimal.valueOf(150.00));
        shipment.setCreatedAt(Instant.now());
        shipment.setUpdatedAt(Instant.now());
        return shipment;
    }

    @Test
    void getDashboardStats_shouldReturnCompleteStats() {
        // Given
        when(orderRepository.findAll()).thenReturn(testOrders);
        when(shipmentRepository.findAll()).thenReturn(testShipments);

        // When
        DashboardStatsResponse response = dashboardService.getDashboardStats();

        // Then
        assertThat(response).isNotNull();
        assertThat(response.getTotalOrders()).isEqualTo(5L);
        assertThat(response.getActiveShipments()).isEqualTo(1L); // Only IN_TRANSIT
        assertThat(response.getDeliveredToday()).isEqualTo(2L); // Two orders delivered today
        assertThat(response.getTotalRevenue()).isEqualByComparingTo(BigDecimal.valueOf(1500.00));
    }

    @Test
    void getDashboardStats_shouldCalculateCourierBreakdown() {
        // Given
        when(orderRepository.findAll()).thenReturn(testOrders);
        when(shipmentRepository.findAll()).thenReturn(testShipments);

        // When
        DashboardStatsResponse response = dashboardService.getDashboardStats();

        // Then
        Map<String, Long> courierBreakdown = response.getCourierBreakdown();
        assertThat(courierBreakdown).isNotNull();
        assertThat(courierBreakdown).hasSize(3);
        assertThat(courierBreakdown.get("FASTSHIP")).isEqualTo(1L);
        assertThat(courierBreakdown.get("QUICKEXPRESS")).isEqualTo(1L);
        assertThat(courierBreakdown.get("RELIABLE")).isEqualTo(1L);
    }

    @Test
    void getDashboardStats_shouldCalculateStatusBreakdown() {
        // Given
        when(orderRepository.findAll()).thenReturn(testOrders);
        when(shipmentRepository.findAll()).thenReturn(testShipments);

        // When
        DashboardStatsResponse response = dashboardService.getDashboardStats();

        // Then
        Map<String, Long> statusBreakdown = response.getStatusBreakdown();
        assertThat(statusBreakdown).isNotNull();
        assertThat(statusBreakdown).containsKey("DELIVERED");
        assertThat(statusBreakdown).containsKey("IN_TRANSIT");
        assertThat(statusBreakdown).containsKey("ORDER_CREATED");
        assertThat(statusBreakdown).containsKey("CANCELLED");
        assertThat(statusBreakdown.get("DELIVERED")).isEqualTo(2L);
    }

    @Test
    void getDashboardStats_shouldHandleEmptyData() {
        // Given
        when(orderRepository.findAll()).thenReturn(List.of());
        when(shipmentRepository.findAll()).thenReturn(List.of());

        // When
        DashboardStatsResponse response = dashboardService.getDashboardStats();

        // Then
        assertThat(response).isNotNull();
        assertThat(response.getTotalOrders()).isEqualTo(0L);
        assertThat(response.getActiveShipments()).isEqualTo(0L);
        assertThat(response.getDeliveredToday()).isEqualTo(0L);
        assertThat(response.getTotalRevenue()).isEqualByComparingTo(BigDecimal.ZERO);
        assertThat(response.getCourierBreakdown()).isEmpty();
        assertThat(response.getStatusBreakdown()).isEmpty();
    }

    @Test
    void getRecentOrders_shouldReturnDefaultLimit() {
        // Given
        PageRequest pageRequest = PageRequest.of(0, 10, Sort.by(Sort.Direction.DESC, "createdAt"));
        when(orderRepository.findAll(pageRequest)).thenReturn(new PageImpl<>(testOrders.subList(0, 3)));

        // When
        RecentOrdersResponse response = dashboardService.getRecentOrders(null);

        // Then
        assertThat(response).isNotNull();
        assertThat(response.getOrders()).hasSize(3);
    }

    @Test
    void getRecentOrders_shouldRespectCustomLimit() {
        // Given
        PageRequest pageRequest = PageRequest.of(0, 5, Sort.by(Sort.Direction.DESC, "createdAt"));
        when(orderRepository.findAll(pageRequest)).thenReturn(new PageImpl<>(testOrders));

        // When
        RecentOrdersResponse response = dashboardService.getRecentOrders(5);

        // Then
        assertThat(response).isNotNull();
        assertThat(response.getOrders()).hasSize(5);
    }

    @Test
    void getRecentOrders_shouldEnforceMaxLimit() {
        // Given
        PageRequest pageRequest = PageRequest.of(0, 50, Sort.by(Sort.Direction.DESC, "createdAt"));
        when(orderRepository.findAll(pageRequest)).thenReturn(new PageImpl<>(testOrders));

        // When
        RecentOrdersResponse response = dashboardService.getRecentOrders(100); // Request 100, should cap at 50

        // Then
        assertThat(response).isNotNull();
        assertThat(response.getOrders()).isNotEmpty();
    }

    @Test
    void getRecentOrders_shouldIncludeCorrectFields() {
        // Given
        PageRequest pageRequest = PageRequest.of(0, 10, Sort.by(Sort.Direction.DESC, "createdAt"));
        when(orderRepository.findAll(pageRequest)).thenReturn(new PageImpl<>(testOrders.subList(0, 1)));

        // When
        RecentOrdersResponse response = dashboardService.getRecentOrders(null);

        // Then
        assertThat(response.getOrders()).hasSize(1);
        RecentOrderResponse order = response.getOrders().get(0);
        assertThat(order.getOrderId()).isEqualTo("ZPY-ORD-10001");
        assertThat(order.getMerchantOrderId()).isEqualTo("MERCHANT-10001");
        assertThat(order.getCustomerName()).isEqualTo("Rahul Sharma");
        assertThat(order.getOrderStatus()).isEqualTo("DELIVERED");
        assertThat(order.getDeliveryCity()).isEqualTo("Mumbai");
        assertThat(order.getCreatedAt()).isNotNull();
    }
}
