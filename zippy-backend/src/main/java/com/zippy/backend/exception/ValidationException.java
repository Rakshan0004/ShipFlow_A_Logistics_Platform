package com.zippy.backend.exception;

import java.util.Map;

public class ValidationException extends RuntimeException {

    private final Map<String, String> details;

    public ValidationException(String message, Map<String, String> details) {
        super(message);
        this.details = details;
    }

    public Map<String, String> getDetails() {
        return details;
    }
}
