package com.zippy.backend.dto;

import java.util.ArrayList;
import java.util.List;

public class RateResponse {

    private String orderId;
    private List<NormalizedShippingOption> shippingOptions = new ArrayList<>();
    private List<WarningDto> warnings = new ArrayList<>();

    public RateResponse() {
    }

    public RateResponse(String orderId, List<NormalizedShippingOption> shippingOptions, List<WarningDto> warnings) {
        this.orderId = orderId;
        this.shippingOptions = shippingOptions != null ? shippingOptions : new ArrayList<>();
        this.warnings = warnings != null ? warnings : new ArrayList<>();
    }

    public String getOrderId() {
        return orderId;
    }

    public void setOrderId(String orderId) {
        this.orderId = orderId;
    }

    public List<NormalizedShippingOption> getShippingOptions() {
        return shippingOptions;
    }

    public void setShippingOptions(List<NormalizedShippingOption> shippingOptions) {
        this.shippingOptions = shippingOptions;
    }

    public List<WarningDto> getWarnings() {
        return warnings;
    }

    public void setWarnings(List<WarningDto> warnings) {
        this.warnings = warnings;
    }
}
