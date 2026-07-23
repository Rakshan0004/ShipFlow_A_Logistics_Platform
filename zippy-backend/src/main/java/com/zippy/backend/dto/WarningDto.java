package com.zippy.backend.dto;

public class WarningDto {

    private String carrierCode;
    private String message;

    public WarningDto() {
    }

    public WarningDto(String carrierCode, String message) {
        this.carrierCode = carrierCode;
        this.message = message;
    }

    public String getCarrierCode() {
        return carrierCode;
    }

    public void setCarrierCode(String carrierCode) {
        this.carrierCode = carrierCode;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
