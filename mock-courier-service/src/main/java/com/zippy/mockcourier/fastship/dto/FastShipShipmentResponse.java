package com.zippy.mockcourier.fastship.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class FastShipShipmentResponse {

    private Boolean success;

    @JsonProperty("shipment_id")
    private String shipmentId;

    @JsonProperty("tracking_number")
    private String trackingNumber;

    @JsonProperty("label_url")
    private String labelUrl;

    private String status;

    public FastShipShipmentResponse() {
    }

    public FastShipShipmentResponse(Boolean success, String shipmentId, String trackingNumber, String labelUrl, String status) {
        this.success = success;
        this.shipmentId = shipmentId;
        this.trackingNumber = trackingNumber;
        this.labelUrl = labelUrl;
        this.status = status;
    }

    public Boolean getSuccess() {
        return success;
    }

    public void setSuccess(Boolean success) {
        this.success = success;
    }

    public String getShipmentId() {
        return shipmentId;
    }

    public void setShipmentId(String shipmentId) {
        this.shipmentId = shipmentId;
    }

    public String getTrackingNumber() {
        return trackingNumber;
    }

    public void setTrackingNumber(String trackingNumber) {
        this.trackingNumber = trackingNumber;
    }

    public String getLabelUrl() {
        return labelUrl;
    }

    public void setLabelUrl(String labelUrl) {
        this.labelUrl = labelUrl;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
