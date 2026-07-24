package com.zippy.backend.dto;

import java.math.BigDecimal;
import java.time.Instant;

/**
 * Simplified order DTO for list views with pagination.
 * Contains only essential fields for display in tables.
 */
public class OrderListItemDto {
    private String orderId;
    private String merchantOrderId;
    private String customerName;
    private String orderStatus;
    private BigDecimal totalAmount;
    private Instant createdAt;
    private String deliveryPincode;
    private String carrierCode;

    public OrderListItemDto() {
    }

    public OrderListItemDto(String orderId, String merchantOrderId, String customerName, 
                             String orderStatus, BigDecimal totalAmount, Instant createdAt, 
                             String deliveryPincode, String carrierCode) {
        this.orderId = orderId;
        this.merchantOrderId = merchantOrderId;
        this.customerName = customerName;
        this.orderStatus = orderStatus;
        this.totalAmount = totalAmount;
        this.createdAt = createdAt;
        this.deliveryPincode = deliveryPincode;
        this.carrierCode = carrierCode;
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

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public String getDeliveryPincode() {
        return deliveryPincode;
    }

    public void setDeliveryPincode(String deliveryPincode) {
        this.deliveryPincode = deliveryPincode;
    }

    public String getCarrierCode() {
        return carrierCode;
    }

    public void setCarrierCode(String carrierCode) {
        this.carrierCode = carrierCode;
    }
}
