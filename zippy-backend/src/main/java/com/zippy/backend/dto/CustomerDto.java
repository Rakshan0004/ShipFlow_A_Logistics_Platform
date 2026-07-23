package com.zippy.backend.dto;

import jakarta.validation.constraints.NotBlank;

public class CustomerDto {

    @NotBlank(message = "Customer name is required")
    private String name;

    @NotBlank(message = "Customer phone number is required")
    private String phone;

    private String email;

    public CustomerDto() {
    }

    public CustomerDto(String name, String phone, String email) {
        this.name = name;
        this.phone = phone;
        this.email = email;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }
}
