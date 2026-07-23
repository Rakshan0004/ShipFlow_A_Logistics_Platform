package com.zippy.backend.exception;

import java.math.BigDecimal;

public class PriceMismatchException extends RuntimeException {

    public PriceMismatchException(BigDecimal expected, BigDecimal actual) {
        super(String.format("Quoted amount mismatch: expected ₹%s but request provided ₹%s", expected, actual));
    }
}
