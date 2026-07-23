package com.zippy.backend.dto;

import java.math.BigDecimal;
import java.time.Instant;

public class SelectCarrierResponse {

    private String orderId;
    private String orderStatus;
    private SelectedCarrierDetail selectedCarrier;

    public SelectCarrierResponse() {
    }

    public SelectCarrierResponse(String orderId, String orderStatus, SelectedCarrierDetail selectedCarrier) {
        this.orderId = orderId;
        this.orderStatus = orderStatus;
        this.selectedCarrier = selectedCarrier;
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

    public SelectedCarrierDetail getSelectedCarrier() {
        return selectedCarrier;
    }

    public void setSelectedCarrier(SelectedCarrierDetail selectedCarrier) {
        this.selectedCarrier = selectedCarrier;
    }

    public static class SelectedCarrierDetail {
        private String carrierCode;
        private String serviceCode;
        private String serviceName;
        private BigDecimal quotedAmount;
        private Instant selectedAt;

        public SelectedCarrierDetail() {
        }

        public SelectedCarrierDetail(String carrierCode, String serviceCode, String serviceName, BigDecimal quotedAmount, Instant selectedAt) {
            this.carrierCode = carrierCode;
            this.serviceCode = serviceCode;
            this.serviceName = serviceName;
            this.quotedAmount = quotedAmount;
            this.selectedAt = selectedAt;
        }

        public String getCarrierCode() {
            return carrierCode;
        }

        public void setCarrierCode(String carrierCode) {
            this.carrierCode = carrierCode;
        }

        public String getServiceCode() {
            return serviceCode;
        }

        public void setServiceCode(String serviceCode) {
            this.serviceCode = serviceCode;
        }

        public String getServiceName() {
            return serviceName;
        }

        public void setServiceName(String serviceName) {
            this.serviceName = serviceName;
        }

        public BigDecimal getQuotedAmount() {
            return quotedAmount;
        }

        public void setQuotedAmount(BigDecimal quotedAmount) {
            this.quotedAmount = quotedAmount;
        }

        public Instant getSelectedAt() {
            return selectedAt;
        }

        public void setSelectedAt(Instant selectedAt) {
            this.selectedAt = selectedAt;
        }
    }
}
