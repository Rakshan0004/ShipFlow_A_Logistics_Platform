package com.zippy.backend.mapper;

import com.zippy.backend.dto.*;
import com.zippy.backend.model.Order;

public class OrderMapper {

    public static Order toEntity(CreateOrderRequest request) {
        Order order = new Order();
        order.setMerchantOrderId(request.getMerchantOrderId());

        if (request.getCustomer() != null) {
            order.setCustomerName(request.getCustomer().getName());
            order.setCustomerPhone(request.getCustomer().getPhone());
            order.setCustomerEmail(request.getCustomer().getEmail());
        }

        if (request.getPickupAddress() != null) {
            order.setPickupAddressLine1(request.getPickupAddress().getAddressLine1());
            order.setPickupCity(request.getPickupAddress().getCity());
            order.setPickupState(request.getPickupAddress().getState());
            order.setPickupPincode(request.getPickupAddress().getPincode());
        }

        if (request.getDeliveryAddress() != null) {
            order.setDeliveryAddressLine1(request.getDeliveryAddress().getAddressLine1());
            order.setDeliveryCity(request.getDeliveryAddress().getCity());
            order.setDeliveryState(request.getDeliveryAddress().getState());
            order.setDeliveryPincode(request.getDeliveryAddress().getPincode());
        }

        if (request.getPackageInfo() != null) {
            order.setWeightGrams(request.getPackageInfo().getWeightGrams());
            order.setLengthCm(request.getPackageInfo().getLengthCm());
            order.setWidthCm(request.getPackageInfo().getWidthCm());
            order.setHeightCm(request.getPackageInfo().getHeightCm());
        }

        order.setPaymentType(request.getPaymentType());
        order.setCodAmount(request.getCodAmount());
        order.setOrderStatus("ORDER_CREATED");

        return order;
    }

    public static OrderResponse toResponse(Order order) {
        OrderResponse response = new OrderResponse();
        response.setOrderId(order.getZippyOrderId());
        response.setMerchantOrderId(order.getMerchantOrderId());

        CustomerDto customer = new CustomerDto(
                order.getCustomerName(),
                order.getCustomerPhone(),
                order.getCustomerEmail()
        );
        response.setCustomer(customer);

        AddressDto pickupAddress = new AddressDto(
                order.getPickupAddressLine1(),
                order.getPickupCity(),
                order.getPickupState(),
                order.getPickupPincode()
        );
        response.setPickupAddress(pickupAddress);

        AddressDto deliveryAddress = new AddressDto(
                order.getDeliveryAddressLine1(),
                order.getDeliveryCity(),
                order.getDeliveryState(),
                order.getDeliveryPincode()
        );
        response.setDeliveryAddress(deliveryAddress);

        PackageDto packageInfo = new PackageDto(
                order.getWeightGrams(),
                order.getLengthCm(),
                order.getWidthCm(),
                order.getHeightCm()
        );
        response.setPackageInfo(packageInfo);

        response.setPaymentType(order.getPaymentType());
        response.setCodAmount(order.getCodAmount());
        response.setOrderStatus(order.getOrderStatus());
        response.setCreatedAt(order.getCreatedAt());
        response.setUpdatedAt(order.getUpdatedAt());

        return response;
    }
}
