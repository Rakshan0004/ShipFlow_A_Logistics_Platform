package com.zippy.backend.service;

import com.zippy.backend.dto.*;
import com.zippy.backend.exception.OrderNotFoundException;
import com.zippy.backend.exception.ValidationException;
import com.zippy.backend.model.Order;
import com.zippy.backend.repository.OrderRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @InjectMocks
    private OrderService orderService;

    private CreateOrderRequest validCodRequest;

    @BeforeEach
    void setUp() {
        validCodRequest = new CreateOrderRequest();
        validCodRequest.setMerchantOrderId("MERCHANT-10001");

        CustomerDto customer = new CustomerDto("Rahul Sharma", "9876543210", "rahul@example.com");
        validCodRequest.setCustomer(customer);

        AddressDto pickup = new AddressDto("15 MG Road", "Bengaluru", "Karnataka", "560001");
        validCodRequest.setPickupAddress(pickup);

        AddressDto delivery = new AddressDto("22 Connaught Place", "New Delhi", "Delhi", "110001");
        validCodRequest.setDeliveryAddress(delivery);

        PackageDto packageInfo = new PackageDto(1500, 20, 15, 10);
        validCodRequest.setPackageInfo(packageInfo);

        validCodRequest.setPaymentType("COD");
        validCodRequest.setCodAmount(new BigDecimal("2500.00"));
    }

    @Test
    void shouldCreateOrderWithGeneratedZippyId() {
        when(orderRepository.count()).thenReturn(0L);
        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> {
            Order saved = invocation.getArgument(0);
            saved.setId(1L);
            return saved;
        });

        OrderResponse response = orderService.createOrder(validCodRequest);

        assertThat(response).isNotNull();
        assertThat(response.getOrderId()).isEqualTo("ZPY-ORD-10001");
        assertThat(response.getMerchantOrderId()).isEqualTo("MERCHANT-10001");
        assertThat(response.getOrderStatus()).isEqualTo("ORDER_CREATED");
        assertThat(response.getCustomer().getName()).isEqualTo("Rahul Sharma");
    }

    @Test
    void shouldRejectOrderWithNegativeWeight() {
        validCodRequest.getPackageInfo().setWeightGrams(-500);

        assertThatThrownBy(() -> orderService.createOrder(validCodRequest))
                .isInstanceOf(ValidationException.class)
                .hasMessageContaining("Order validation failed");
    }

    @Test
    void shouldRejectCodOrderWithoutCodAmount() {
        validCodRequest.setCodAmount(null);

        assertThatThrownBy(() -> orderService.createOrder(validCodRequest))
                .isInstanceOf(ValidationException.class)
                .hasMessageContaining("Order validation failed");
    }

    @Test
    void shouldRejectCodOrderWithZeroCodAmount() {
        validCodRequest.setCodAmount(BigDecimal.ZERO);

        assertThatThrownBy(() -> orderService.createOrder(validCodRequest))
                .isInstanceOf(ValidationException.class)
                .hasMessageContaining("Order validation failed");
    }

    @Test
    void shouldRejectInvalidPaymentType() {
        validCodRequest.setPaymentType("BITCOIN");

        assertThatThrownBy(() -> orderService.createOrder(validCodRequest))
                .isInstanceOf(ValidationException.class)
                .hasMessageContaining("Order validation failed");
    }

    @Test
    void shouldReturnOrderById() {
        Order mockOrder = new Order();
        mockOrder.setId(1L);
        mockOrder.setZippyOrderId("ZPY-ORD-10001");
        mockOrder.setMerchantOrderId("MERCHANT-10001");
        mockOrder.setCustomerName("Rahul Sharma");
        mockOrder.setCustomerPhone("9876543210");
        mockOrder.setCustomerEmail("rahul@example.com");
        mockOrder.setPickupPincode("560001");
        mockOrder.setDeliveryPincode("110001");
        mockOrder.setWeightGrams(1500);
        mockOrder.setPaymentType("COD");
        mockOrder.setCodAmount(new BigDecimal("2500.00"));
        mockOrder.setOrderStatus("ORDER_CREATED");

        when(orderRepository.findByZippyOrderId("ZPY-ORD-10001")).thenReturn(Optional.of(mockOrder));

        OrderResponse response = orderService.getOrder("ZPY-ORD-10001");

        assertThat(response).isNotNull();
        assertThat(response.getOrderId()).isEqualTo("ZPY-ORD-10001");
        assertThat(response.getMerchantOrderId()).isEqualTo("MERCHANT-10001");
    }

    @Test
    void shouldReturn404ForNonExistentOrder() {
        when(orderRepository.findByZippyOrderId("ZPY-ORD-99999")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> orderService.getOrder("ZPY-ORD-99999"))
                .isInstanceOf(OrderNotFoundException.class)
                .hasMessageContaining("Order not found: ZPY-ORD-99999");
    }
}
