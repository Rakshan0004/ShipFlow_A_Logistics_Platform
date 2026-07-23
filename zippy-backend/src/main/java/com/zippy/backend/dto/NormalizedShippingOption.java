package com.zippy.backend.dto;

import com.fasterxml.jackson.annotation.JsonIgnore;
import java.math.BigDecimal;

public class NormalizedShippingOption {

    private String carrierCode;
    private String carrierName;
    private String serviceCode;
    private String serviceName;
    private BigDecimal baseCharge;
    private BigDecimal codCharge;
    private BigDecimal additionalCharges;
    private BigDecimal tax;
    private BigDecimal totalCharge;
    private Integer estimatedMinDays;
    private Integer estimatedMaxDays;

    @JsonIgnore
    private String rawCarrierResponse;

    public NormalizedShippingOption() {
    }

    public NormalizedShippingOption(String carrierCode, String carrierName, String serviceCode, String serviceName, BigDecimal baseCharge, BigDecimal codCharge, BigDecimal additionalCharges, BigDecimal tax, BigDecimal totalCharge, Integer estimatedMinDays, Integer estimatedMaxDays) {
        this.carrierCode = carrierCode;
        this.carrierName = carrierName;
        this.serviceCode = serviceCode;
        this.serviceName = serviceName;
        this.baseCharge = baseCharge;
        this.codCharge = codCharge;
        this.additionalCharges = additionalCharges;
        this.tax = tax;
        this.totalCharge = totalCharge;
        this.estimatedMinDays = estimatedMinDays;
        this.estimatedMaxDays = estimatedMaxDays;
    }

    public String getCarrierCode() {
        return carrierCode;
    }

    public void setCarrierCode(String carrierCode) {
        this.carrierCode = carrierCode;
    }

    public String getCarrierName() {
        return carrierName;
    }

    public void setCarrierName(String carrierName) {
        this.carrierName = carrierName;
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

    public BigDecimal getBaseCharge() {
        return baseCharge;
    }

    public void setBaseCharge(BigDecimal baseCharge) {
        this.baseCharge = baseCharge;
    }

    public BigDecimal getCodCharge() {
        return codCharge;
    }

    public void setCodCharge(BigDecimal codCharge) {
        this.codCharge = codCharge;
    }

    public BigDecimal getAdditionalCharges() {
        return additionalCharges;
    }

    public void setAdditionalCharges(BigDecimal additionalCharges) {
        this.additionalCharges = additionalCharges;
    }

    public BigDecimal getTax() {
        return tax;
    }

    public void setTax(BigDecimal tax) {
        this.tax = tax;
    }

    public BigDecimal getTotalCharge() {
        return totalCharge;
    }

    public void setTotalCharge(BigDecimal totalCharge) {
        this.totalCharge = totalCharge;
    }

    public Integer getEstimatedMinDays() {
        return estimatedMinDays;
    }

    public void setEstimatedMinDays(Integer estimatedMinDays) {
        this.estimatedMinDays = estimatedMinDays;
    }

    public Integer getEstimatedMaxDays() {
        return estimatedMaxDays;
    }

    public void setEstimatedMaxDays(Integer estimatedMaxDays) {
        this.estimatedMaxDays = estimatedMaxDays;
    }

    public String getRawCarrierResponse() {
        return rawCarrierResponse;
    }

    public void setRawCarrierResponse(String rawCarrierResponse) {
        this.rawCarrierResponse = rawCarrierResponse;
    }
}
