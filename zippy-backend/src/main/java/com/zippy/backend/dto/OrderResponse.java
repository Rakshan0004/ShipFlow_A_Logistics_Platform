package com.zippy.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.math.BigDecimal;
import java.time.Instant;

public class OrderResponse {

    private String orderId;
    private String merchantOrderId;
    private CustomerDto customer;
    private AddressDto pickupAddress;
    private AddressDto deliveryAddress;
    private BigDecimal codAmount;

    @JsonProperty("package")
    private PackageDto packageInfo;

    private String paymentType;
    private String orderStatus;
    private Object selectedCarrier;
    private Object shipment;
    private Instant createdAt;
    private Instant updatedAt;

    public OrderResponse() {
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

    public CustomerDto getCustomer() {
        return customer;
    }

    public void setCustomer(CustomerDto customer) {
        this.customer = customer;
    }

    public AddressDto getPickupAddress() {
        return pickupAddress;
    }

    public void setPickupAddress(AddressDto pickupAddress) {
        this.pickupAddress = pickupAddress;
    }

    public AddressDto getDeliveryAddress() {
        return deliveryAddress;
    }

    public void setDeliveryAddress(AddressDto deliveryAddress) {
        this.deliveryAddress = deliveryAddress;
    }

    public PackageDto getPackageInfo() {
        return packageInfo;
    }

    public void setPackageInfo(PackageDto packageInfo) {
        this.packageInfo = packageInfo;
    }

    public String getPaymentType() {
        return paymentType;
    }

    public void setPaymentType(String paymentType) {
        this.paymentType = paymentType;
    }

    public BigDecimal getCodAmount() {
        return codAmount;
    }

    public void setCodAmount(BigDecimal codAmount) {
        this.codAmount = codAmount;
    }

    public String getOrderStatus() {
        return orderStatus;
    }

    public void setOrderStatus(String orderStatus) {
        this.orderStatus = orderStatus;
    }

    public Object getSelectedCarrier() {
        return selectedCarrier;
    }

    public void setSelectedCarrier(Object selectedCarrier) {
        this.selectedCarrier = selectedCarrier;
    }

    public Object getShipment() {
        return shipment;
    }

    public void setShipment(Object shipment) {
        this.shipment = shipment;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}
