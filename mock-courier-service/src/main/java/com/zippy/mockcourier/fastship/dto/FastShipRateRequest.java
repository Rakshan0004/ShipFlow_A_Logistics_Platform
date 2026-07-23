package com.zippy.mockcourier.fastship.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.math.BigDecimal;

public class FastShipRateRequest {

    @JsonProperty("origin_pin")
    private String originPin;

    @JsonProperty("destination_pin")
    private String destinationPin;

    @JsonProperty("weight_kg")
    private Double weightKg;

    @JsonProperty("payment_mode")
    private String paymentMode;

    @JsonProperty("invoice_value")
    private BigDecimal invoiceValue;

    public FastShipRateRequest() {
    }

    public String getOriginPin() {
        return originPin;
    }

    public void setOriginPin(String originPin) {
        this.originPin = originPin;
    }

    public String getDestinationPin() {
        return destinationPin;
    }

    public void setDestinationPin(String destinationPin) {
        this.destinationPin = destinationPin;
    }

    public Double getWeightKg() {
        return weightKg;
    }

    public void setWeightKg(Double weightKg) {
        this.weightKg = weightKg;
    }

    public String getPaymentMode() {
        return paymentMode;
    }

    public void setPaymentMode(String paymentMode) {
        this.paymentMode = paymentMode;
    }

    public BigDecimal getInvoiceValue() {
        return invoiceValue;
    }

    public void setInvoiceValue(BigDecimal invoiceValue) {
        this.invoiceValue = invoiceValue;
    }
}
