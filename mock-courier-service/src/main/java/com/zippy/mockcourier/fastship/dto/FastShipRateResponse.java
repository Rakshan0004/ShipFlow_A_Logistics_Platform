package com.zippy.mockcourier.fastship.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.math.BigDecimal;

public class FastShipRateResponse {

    private Boolean success;
    private ServiceDetail service;

    public FastShipRateResponse() {
    }

    public FastShipRateResponse(Boolean success, ServiceDetail service) {
        this.success = success;
        this.service = service;
    }

    public Boolean getSuccess() {
        return success;
    }

    public void setSuccess(Boolean success) {
        this.success = success;
    }

    public ServiceDetail getService() {
        return service;
    }

    public void setService(ServiceDetail service) {
        this.service = service;
    }

    public static class ServiceDetail {
        @JsonProperty("service_code")
        private String serviceCode;

        @JsonProperty("service_name")
        private String serviceName;

        @JsonProperty("freight_charge")
        private BigDecimal freightCharge;

        @JsonProperty("cod_charge")
        private BigDecimal codCharge;

        private BigDecimal tax;

        @JsonProperty("total_amount")
        private BigDecimal totalAmount;

        @JsonProperty("estimated_days")
        private Integer estimatedDays;

        public ServiceDetail() {
        }

        public ServiceDetail(String serviceCode, String serviceName, BigDecimal freightCharge, BigDecimal codCharge, BigDecimal tax, BigDecimal totalAmount, Integer estimatedDays) {
            this.serviceCode = serviceCode;
            this.serviceName = serviceName;
            this.freightCharge = freightCharge;
            this.codCharge = codCharge;
            this.tax = tax;
            this.totalAmount = totalAmount;
            this.estimatedDays = estimatedDays;
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

        public BigDecimal getFreightCharge() {
            return freightCharge;
        }

        public void setFreightCharge(BigDecimal freightCharge) {
            this.freightCharge = freightCharge;
        }

        public BigDecimal getCodCharge() {
            return codCharge;
        }

        public void setCodCharge(BigDecimal codCharge) {
            this.codCharge = codCharge;
        }

        public BigDecimal getTax() {
            return tax;
        }

        public void setTax(BigDecimal tax) {
            this.tax = tax;
        }

        public BigDecimal getTotalAmount() {
            return totalAmount;
        }

        public void setTotalAmount(BigDecimal totalAmount) {
            this.totalAmount = totalAmount;
        }

        public Integer getEstimatedDays() {
            return estimatedDays;
        }

        public void setEstimatedDays(Integer estimatedDays) {
            this.estimatedDays = estimatedDays;
        }
    }
}
