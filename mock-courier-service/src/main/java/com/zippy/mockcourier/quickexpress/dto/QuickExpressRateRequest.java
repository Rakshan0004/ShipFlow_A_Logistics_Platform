package com.zippy.mockcourier.quickexpress.dto;

import java.math.BigDecimal;

public class QuickExpressRateRequest {

    private String pickupPincode;
    private String deliveryPincode;
    private Integer weightInGrams;
    private Dimensions dimensions;
    private Boolean isCod;
    private BigDecimal collectableAmount;

    public QuickExpressRateRequest() {
    }

    public String getPickupPincode() {
        return pickupPincode;
    }

    public void setPickupPincode(String pickupPincode) {
        this.pickupPincode = pickupPincode;
    }

    public String getDeliveryPincode() {
        return deliveryPincode;
    }

    public void setDeliveryPincode(String deliveryPincode) {
        this.deliveryPincode = deliveryPincode;
    }

    public Integer getWeightInGrams() {
        return weightInGrams;
    }

    public void setWeightInGrams(Integer weightInGrams) {
        this.weightInGrams = weightInGrams;
    }

    public Dimensions getDimensions() {
        return dimensions;
    }

    public void setDimensions(Dimensions dimensions) {
        this.dimensions = dimensions;
    }

    public Boolean getIsCod() {
        return isCod;
    }

    public void setIsCod(Boolean isCod) {
        this.isCod = isCod;
    }

    public BigDecimal getCollectableAmount() {
        return collectableAmount;
    }

    public void setCollectableAmount(BigDecimal collectableAmount) {
        this.collectableAmount = collectableAmount;
    }

    public static class Dimensions {
        private Integer length;
        private Integer breadth;
        private Integer height;

        public Dimensions() {}

        public Dimensions(Integer length, Integer breadth, Integer height) {
            this.length = length;
            this.breadth = breadth;
            this.height = height;
        }

        public Integer getLength() { return length; }
        public void setLength(Integer length) { this.length = length; }
        public Integer getBreadth() { return breadth; }
        public void setBreadth(Integer breadth) { this.breadth = breadth; }
        public Integer getHeight() { return height; }
        public void setHeight(Integer height) { this.height = height; }
    }
}
