package com.zippy.backend.dto;

import java.math.BigDecimal;
import java.time.Instant;

public class ShipmentResponse {

    private String orderId;
    private String orderStatus;
    private ShipmentDetail shipment;

    public ShipmentResponse() {
    }

    public ShipmentResponse(String orderId, String orderStatus, ShipmentDetail shipment) {
        this.orderId = orderId;
        this.orderStatus = orderStatus;
        this.shipment = shipment;
    }

    public String getOrderId() {
        return orderId;
    }

    public void setOrderId(String orderId) {
        this.orderId = orderId;
    }

    public String getOrderStatus() {
        return orderStatus;
    }

    public void setOrderStatus(String orderStatus) {
        this.orderStatus = orderStatus;
    }

    public ShipmentDetail getShipment() {
        return shipment;
    }

    public void setShipment(ShipmentDetail shipment) {
        this.shipment = shipment;
    }

    public static class ShipmentDetail {
        private String carrierCode;
        private String carrierShipmentId;
        private String trackingNumber;
        private String serviceCode;
        private BigDecimal quotedAmount;
        private String currentStatus;
        private Instant createdAt;

        public ShipmentDetail() {
        }

        public ShipmentDetail(String carrierCode, String carrierShipmentId, String trackingNumber, String serviceCode, BigDecimal quotedAmount, String currentStatus, Instant createdAt) {
            this.carrierCode = carrierCode;
            this.carrierShipmentId = carrierShipmentId;
            this.trackingNumber = trackingNumber;
            this.serviceCode = serviceCode;
            this.quotedAmount = quotedAmount;
            this.currentStatus = currentStatus;
            this.createdAt = createdAt;
        }

        public String getCarrierCode() {
            return carrierCode;
        }

        public void setCarrierCode(String carrierCode) {
            this.carrierCode = carrierCode;
        }

        public String getCarrierShipmentId() {
            return carrierShipmentId;
        }

        public void setCarrierShipmentId(String carrierShipmentId) {
            this.carrierShipmentId = carrierShipmentId;
        }

        public String getTrackingNumber() {
            return trackingNumber;
        }

        public void setTrackingNumber(String trackingNumber) {
            this.trackingNumber = trackingNumber;
        }

        public String getServiceCode() {
            return serviceCode;
        }

        public void setServiceCode(String serviceCode) {
            this.serviceCode = serviceCode;
        }

        public BigDecimal getQuotedAmount() {
            return quotedAmount;
        }

        public void setQuotedAmount(BigDecimal quotedAmount) {
            this.quotedAmount = quotedAmount;
        }

        public String getCurrentStatus() {
            return currentStatus;
        }

        public void setCurrentStatus(String currentStatus) {
            this.currentStatus = currentStatus;
        }

        public Instant getCreatedAt() {
            return createdAt;
        }

        public void setCreatedAt(Instant createdAt) {
            this.createdAt = createdAt;
        }
    }
}
