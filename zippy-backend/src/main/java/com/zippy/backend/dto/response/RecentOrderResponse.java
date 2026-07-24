package com.zippy.backend.dto.response;

import java.time.Instant;

public class RecentOrderResponse {

    private String orderId;
    private String merchantOrderId;
    private String customerName;
    private String orderStatus;
    private Instant createdAt;
    private String deliveryCity;

    public RecentOrderResponse() {
    }

    public RecentOrderResponse(String orderId, String merchantOrderId, String customerName, 
                               String orderStatus, Instant createdAt, String deliveryCity) {
        this.orderId = orderId;
        this.merchantOrderId = merchantOrderId;
        this.customerName = customerName;
        this.orderStatus = orderStatus;
        this.createdAt = createdAt;
        this.deliveryCity = deliveryCity;
    }

    public String getOrderId() {
        return orderId;
    }

    public void setOrderId(String orderId) {
        this.orderId = orderId;
    }

    public String getMerchantOrderId() {
        return merchantOrderId;
    }

    public void setMerchantOrderId(String merchantOrderId) {
        this.merchantOrderId = merchantOrderId;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public String getOrderStatus() {
        return orderStatus;
    }

    public void setOrderStatus(String orderStatus) {
        this.orderStatus = orderStatus;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public String getDeliveryCity() {
        return deliveryCity;
    }

    public void setDeliveryCity(String deliveryCity) {
        this.deliveryCity = deliveryCity;
    }
}
