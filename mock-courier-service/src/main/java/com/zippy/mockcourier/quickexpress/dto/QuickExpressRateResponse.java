package com.zippy.mockcourier.quickexpress.dto;

import java.math.BigDecimal;

public class QuickExpressRateResponse {

    private String status;
    private String quoteId;
    private Charges charges;
    private BigDecimal payable;
    private DeliveryEstimate deliveryEstimate;
    private String product;

    public QuickExpressRateResponse() {
    }

    public QuickExpressRateResponse(String status, String quoteId, Charges charges, BigDecimal payable, DeliveryEstimate deliveryEstimate, String product) {
        this.status = status;
        this.quoteId = quoteId;
        this.charges = charges;
        this.payable = payable;
        this.deliveryEstimate = deliveryEstimate;
        this.product = product;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getQuoteId() {
        return quoteId;
    }

    public void setQuoteId(String quoteId) {
        this.quoteId = quoteId;
    }

    public Charges getCharges() {
        return charges;
    }

    public void setCharges(Charges charges) {
        this.charges = charges;
    }

    public BigDecimal getPayable() {
        return payable;
    }

    public void setPayable(BigDecimal payable) {
        this.payable = payable;
    }

    public DeliveryEstimate getDeliveryEstimate() {
        return deliveryEstimate;
    }

    public void setDeliveryEstimate(DeliveryEstimate deliveryEstimate) {
        this.deliveryEstimate = deliveryEstimate;
    }

    public String getProduct() {
        return product;
    }

    public void setProduct(String product) {
        this.product = product;
    }

    public static class Charges {
        private BigDecimal shipping;
        private BigDecimal cod;
        private BigDecimal fuelSurcharge;
        private BigDecimal gst;

        public Charges() {}

        public Charges(BigDecimal shipping, BigDecimal cod, BigDecimal fuelSurcharge, BigDecimal gst) {
            this.shipping = shipping;
            this.cod = cod;
            this.fuelSurcharge = fuelSurcharge;
            this.gst = gst;
        }

        public BigDecimal getShipping() { return shipping; }
        public void setShipping(BigDecimal shipping) { this.shipping = shipping; }
        public BigDecimal getCod() { return cod; }
        public void setCod(BigDecimal cod) { this.cod = cod; }
        public BigDecimal getFuelSurcharge() { return fuelSurcharge; }
        public void setFuelSurcharge(BigDecimal fuelSurcharge) { this.fuelSurcharge = fuelSurcharge; }
        public BigDecimal getGst() { return gst; }
        public void setGst(BigDecimal gst) { this.gst = gst; }
    }

    public static class DeliveryEstimate {
        private Integer minimumDays;
        private Integer maximumDays;

        public DeliveryEstimate() {}

        public DeliveryEstimate(Integer minimumDays, Integer maximumDays) {
            this.minimumDays = minimumDays;
            this.maximumDays = maximumDays;
        }

        public Integer getMinimumDays() { return minimumDays; }
        public void setMinimumDays(Integer minimumDays) { this.minimumDays = minimumDays; }
        public Integer getMaximumDays() { return maximumDays; }
        public void setMaximumDays(Integer maximumDays) { this.maximumDays = maximumDays; }
    }
}
