package com.zippy.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public class SelectCarrierRequest {

    @NotBlank(message = "Carrier code is required")
    private String carrierCode;

    @NotBlank(message = "Service code is required")
    private String serviceCode;

    @NotNull(message = "Quoted amount is required")
    private BigDecimal quotedAmount;

    public SelectCarrierRequest() {
    }

    public SelectCarrierRequest(String carrierCode, String serviceCode, BigDecimal quotedAmount) {
        this.carrierCode = carrierCode;
        this.serviceCode = serviceCode;
        this.quotedAmount = quotedAmount;
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

    public BigDecimal getQuotedAmount() {
        return quotedAmount;
    }

    public void setQuotedAmount(BigDecimal quotedAmount) {
        this.quotedAmount = quotedAmount;
    }
}
