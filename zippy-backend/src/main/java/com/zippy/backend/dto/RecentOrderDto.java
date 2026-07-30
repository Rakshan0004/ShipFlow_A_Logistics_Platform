package com.zippy.backend.dto;

import java.time.Instant;

public class RecentOrderDto {

    private String orderId;
    private String merchantOrderId;
    private String customerName;
    private String orderStatus;
    private Instant createdAt;
    private String deliveryCity;
    private String codAmount;

    public RecentOrderDto() {
    }

    public RecentOrderDto(String orderId, String merchantOrderId, String customerName,
            String orderStatus, Instant createdAt, String deliveryCity, String codAmount) {
        this.orderId = orderId;
        this.merchantOrderId = merchantOrderId;
        this.customerName = customerName;
        this.orderStatus = orderStatus;
        this.createdAt = createdAt;
        this.deliveryCity = deliveryCity;
        this.codAmount = codAmount;

    }

    public String getCodAmount() {
        return codAmount;
    }

    public void setCodAmount(String codAmount) {
        this.codAmount = codAmount;
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
