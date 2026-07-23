package com.zippy.mockcourier.reliable.dto;

import java.math.BigDecimal;
import java.util.List;

public class ReliableCourierRateResponse {

    private Integer code;
    private List<OptionData> data;

    public ReliableCourierRateResponse() {
    }

    public ReliableCourierRateResponse(Integer code, List<OptionData> data) {
        this.code = code;
        this.data = data;
    }

    public Integer getCode() {
        return code;
    }

    public void setCode(Integer code) {
        this.code = code;
    }

    public List<OptionData> getData() {
        return data;
    }

    public void setData(List<OptionData> data) {
        this.data = data;
    }

    public static class OptionData {
        private String id;
        private String name;
        private RateDetail rate;
        private String eta;

        public OptionData() {}

        public OptionData(String id, String name, RateDetail rate, String eta) {
            this.id = id;
            this.name = name;
            this.rate = rate;
            this.eta = eta;
        }

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public RateDetail getRate() { return rate; }
        public void setRate(RateDetail rate) { this.rate = rate; }
        public String getEta() { return eta; }
        public void setEta(String eta) { this.eta = eta; }
    }

    public static class RateDetail {
        private BigDecimal base;
        private BigDecimal handling;
        private BigDecimal cashCollectionFee;
        private BigDecimal taxAmount;
        private BigDecimal grandTotal;

        public RateDetail() {}

        public RateDetail(BigDecimal base, BigDecimal handling, BigDecimal cashCollectionFee, BigDecimal taxAmount, BigDecimal grandTotal) {
            this.base = base;
            this.handling = handling;
            this.cashCollectionFee = cashCollectionFee;
            this.taxAmount = taxAmount;
            this.grandTotal = grandTotal;
        }

        public BigDecimal getBase() { return base; }
        public void setBase(BigDecimal base) { this.base = base; }
        public BigDecimal getHandling() { return handling; }
        public void setHandling(BigDecimal handling) { this.handling = handling; }
        public BigDecimal getCashCollectionFee() { return cashCollectionFee; }
        public void setCashCollectionFee(BigDecimal cashCollectionFee) { this.cashCollectionFee = cashCollectionFee; }
        public BigDecimal getTaxAmount() { return taxAmount; }
        public void setTaxAmount(BigDecimal taxAmount) { this.taxAmount = taxAmount; }
        public BigDecimal getGrandTotal() { return grandTotal; }
        public void setGrandTotal(BigDecimal grandTotal) { this.grandTotal = grandTotal; }
    }
}
