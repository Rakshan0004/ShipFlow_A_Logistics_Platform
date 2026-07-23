package com.zippy.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public class CreateOrderRequest {

    @NotBlank(message = "Merchant order ID is required")
    private String merchantOrderId;

    @NotNull(message = "Customer details are required")
    @Valid
    private CustomerDto customer;

    @NotNull(message = "Pickup address is required")
    @Valid
    private AddressDto pickupAddress;

    @NotNull(message = "Delivery address is required")
    @Valid
    private AddressDto deliveryAddress;

    @NotNull(message = "Package details are required")
    @Valid
    @JsonProperty("package")
    private PackageDto packageInfo;

    @NotBlank(message = "Payment type is required")
    private String paymentType;

    private BigDecimal codAmount;

    public CreateOrderRequest() {
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
}
