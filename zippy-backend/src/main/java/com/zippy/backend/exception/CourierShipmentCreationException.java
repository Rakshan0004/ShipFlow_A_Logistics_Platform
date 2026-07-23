package com.zippy.backend.exception;

public class CourierShipmentCreationException extends RuntimeException {

    public CourierShipmentCreationException(String carrierCode, String message) {
        super(String.format("Failed to create shipment with courier %s: %s", carrierCode, message));
    }
}
