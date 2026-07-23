package com.zippy.mockcourier.reliable.dto;

public class ReliableCourierShipmentResponse {

    private String result;
    private DeliveryOrder deliveryOrder;
    private String message;

    public ReliableCourierShipmentResponse() {
    }

    public ReliableCourierShipmentResponse(String result, DeliveryOrder deliveryOrder, String message) {
        this.result = result;
        this.deliveryOrder = deliveryOrder;
        this.message = message;
    }

    public String getResult() {
        return result;
    }

    public void setResult(String result) {
        this.result = result;
    }

    public DeliveryOrder getDeliveryOrder() {
        return deliveryOrder;
    }

    public void setDeliveryOrder(DeliveryOrder deliveryOrder) {
        this.deliveryOrder = deliveryOrder;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public static class DeliveryOrder {
        private String id;
        private String trackingCode;

        public DeliveryOrder() {}

        public DeliveryOrder(String id, String trackingCode) {
            this.id = id;
            this.trackingCode = trackingCode;
        }

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getTrackingCode() { return trackingCode; }
        public void setTrackingCode(String trackingCode) { this.trackingCode = trackingCode; }
    }
}
