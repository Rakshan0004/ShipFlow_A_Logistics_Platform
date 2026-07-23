package com.zippy.mockcourier.fastship.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.math.BigDecimal;

public class FastShipShipmentRequest {

    @JsonProperty("reference_number")
    private String referenceNumber;

    @JsonProperty("service_code")
    private String serviceCode;

    private Shipper shipper;
    private Consignee consignee;
    private Parcel parcel;
    private CodDetail cod;

    @JsonProperty("callback_url")
    private String callbackUrl;

    public FastShipShipmentRequest() {
    }

    public String getReferenceNumber() {
        return referenceNumber;
    }

    public void setReferenceNumber(String referenceNumber) {
        this.referenceNumber = referenceNumber;
    }

    public String getServiceCode() {
        return serviceCode;
    }

    public void setServiceCode(String serviceCode) {
        this.serviceCode = serviceCode;
    }

    public Shipper getShipper() {
        return shipper;
    }

    public void setShipper(Shipper shipper) {
        this.shipper = shipper;
    }

    public Consignee getConsignee() {
        return consignee;
    }

    public void setConsignee(Consignee consignee) {
        this.consignee = consignee;
    }

    public Parcel getParcel() {
        return parcel;
    }

    public void setParcel(Parcel parcel) {
        this.parcel = parcel;
    }

    public CodDetail getCod() {
        return cod;
    }

    public void setCod(CodDetail cod) {
        this.cod = cod;
    }

    public String getCallbackUrl() {
        return callbackUrl;
    }

    public void setCallbackUrl(String callbackUrl) {
        this.callbackUrl = callbackUrl;
    }

    public static class Shipper {
        private String name;
        @JsonProperty("postal_code")
        private String postalCode;

        public Shipper() {}

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getPostalCode() { return postalCode; }
        public void setPostalCode(String postalCode) { this.postalCode = postalCode; }
    }

    public static class Consignee {
        private String name;
        private String phone;
        @JsonProperty("postal_code")
        private String postalCode;

        public Consignee() {}

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }
        public String getPostalCode() { return postalCode; }
        public void setPostalCode(String postalCode) { this.postalCode = postalCode; }
    }

    public static class Parcel {
        @JsonProperty("weight_kg")
        private Double weightKg;

        public Parcel() {}

        public Double getWeightKg() { return weightKg; }
        public void setWeightKg(Double weightKg) { this.weightKg = weightKg; }
    }

    public static class CodDetail {
        private Boolean enabled;
        private BigDecimal amount;

        public CodDetail() {}

        public Boolean getEnabled() { return enabled; }
        public void setEnabled(Boolean enabled) { this.enabled = enabled; }
        public BigDecimal getAmount() { return amount; }
        public void setAmount(BigDecimal amount) { this.amount = amount; }
    }
}
