package com.zippy.backend.exception;

public class CourierUnavailableException extends RuntimeException {

    private final String carrierCode;

    public CourierUnavailableException(String carrierCode, String message) {
        super("Courier " + carrierCode + " unavailable: " + message);
        this.carrierCode = carrierCode;
    }

    public CourierUnavailableException(String carrierCode, Throwable cause) {
        super("Courier " + carrierCode + " unavailable", cause);
        this.carrierCode = carrierCode;
    }

    public String getCarrierCode() {
        return carrierCode;
    }
}
