package com.zippy.mockcourier.reliable.dto;

import java.math.BigDecimal;

public class ReliableCourierShipmentRequest {

    private String orderReference;
    private String selectedOption;
    private Destination destination;
    private ParcelWeight parcelWeight;
    private String collectionType;
    private BigDecimal collectionAmount;
    private String statusNotificationUrl;

    public ReliableCourierShipmentRequest() {
    }

    public String getOrderReference() {
        return orderReference;
    }

    public void setOrderReference(String orderReference) {
        this.orderReference = orderReference;
    }

    public String getSelectedOption() {
        return selectedOption;
    }

    public void setSelectedOption(String selectedOption) {
        this.selectedOption = selectedOption;
    }

    public Destination getDestination() {
        return destination;
    }

    public void setDestination(Destination destination) {
        this.destination = destination;
    }

    public ParcelWeight getParcelWeight() {
        return parcelWeight;
    }

    public void setParcelWeight(ParcelWeight parcelWeight) {
        this.parcelWeight = parcelWeight;
    }

    public String getCollectionType() {
        return collectionType;
    }

    public void setCollectionType(String collectionType) {
        this.collectionType = collectionType;
    }

    public BigDecimal getCollectionAmount() {
        return collectionAmount;
    }

    public void setCollectionAmount(BigDecimal collectionAmount) {
        this.collectionAmount = collectionAmount;
    }

    public String getStatusNotificationUrl() {
        return statusNotificationUrl;
    }

    public void setStatusNotificationUrl(String statusNotificationUrl) {
        this.statusNotificationUrl = statusNotificationUrl;
    }

    public static class Destination {
        private String contact;
        private String phone;
        private String zip;

        public Destination() {}

        public String getContact() { return contact; }
        public void setContact(String contact) { this.contact = contact; }
        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }
        public String getZip() { return zip; }
        public void setZip(String zip) { this.zip = zip; }
    }

    public static class ParcelWeight {
        private Double value;
        private String unit;

        public ParcelWeight() {}

        public Double getValue() { return value; }
        public void setValue(Double value) { this.value = value; }
        public String getUnit() { return unit; }
        public void setUnit(String unit) { this.unit = unit; }
    }
}
