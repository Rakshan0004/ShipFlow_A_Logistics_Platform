package com.zippy.mockcourier.quickexpress.dto;

import java.math.BigDecimal;

public class QuickExpressShipmentRequest {

    private String clientOrderId;
    private String quoteId;
    private String productType;
    private ReceiverDetails receiverDetails;
    private PackageDetails packageDetails;
    private Payment payment;
    private String webhook;

    public QuickExpressShipmentRequest() {
    }

    public String getClientOrderId() {
        return clientOrderId;
    }

    public void setClientOrderId(String clientOrderId) {
        this.clientOrderId = clientOrderId;
    }

    public String getQuoteId() {
        return quoteId;
    }

    public void setQuoteId(String quoteId) {
        this.quoteId = quoteId;
    }

    public String getProductType() {
        return productType;
    }

    public void setProductType(String productType) {
        this.productType = productType;
    }

    public ReceiverDetails getReceiverDetails() {
        return receiverDetails;
    }

    public void setReceiverDetails(ReceiverDetails receiverDetails) {
        this.receiverDetails = receiverDetails;
    }

    public PackageDetails getPackageDetails() {
        return packageDetails;
    }

    public void setPackageDetails(PackageDetails packageDetails) {
        this.packageDetails = packageDetails;
    }

    public Payment getPayment() {
        return payment;
    }

    public void setPayment(Payment payment) {
        this.payment = payment;
    }

    public String getWebhook() {
        return webhook;
    }

    public void setWebhook(String webhook) {
        this.webhook = webhook;
    }

    public static class ReceiverDetails {
        private String fullName;
        private String mobileNumber;
        private String postalCode;

        public ReceiverDetails() {}

        public String getFullName() { return fullName; }
        public void setFullName(String fullName) { this.fullName = fullName; }
        public String getMobileNumber() { return mobileNumber; }
        public void setMobileNumber(String mobileNumber) { this.mobileNumber = mobileNumber; }
        public String getPostalCode() { return postalCode; }
        public void setPostalCode(String postalCode) { this.postalCode = postalCode; }
    }

    public static class PackageDetails {
        private Integer deadWeight;
        private String weightUnit;

        public PackageDetails() {}

        public Integer getDeadWeight() { return deadWeight; }
        public void setDeadWeight(Integer deadWeight) { this.deadWeight = deadWeight; }
        public String getWeightUnit() { return weightUnit; }
        public void setWeightUnit(String weightUnit) { this.weightUnit = weightUnit; }
    }

    public static class Payment {
        private String mode;
        private BigDecimal amountToCollect;

        public Payment() {}

        public String getMode() { return mode; }
        public void setMode(String mode) { this.mode = mode; }
        public BigDecimal getAmountToCollect() { return amountToCollect; }
        public void setAmountToCollect(BigDecimal amountToCollect) { this.amountToCollect = amountToCollect; }
    }
}
