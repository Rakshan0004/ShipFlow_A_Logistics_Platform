package com.zippy.backend.controller;

import com.zippy.backend.dto.PaymentResponse;
import com.zippy.backend.service.PaymentService;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "*")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    /**
     * GET /api/payments/{orderId}
     * Returns the payment for a specific order. Auto-generates if it doesn't exist yet.
     */
    @GetMapping("/{orderId}")
    public ResponseEntity<PaymentResponse> getPaymentByOrderId(@PathVariable String orderId) {
        PaymentResponse response = paymentService.getOrCreatePayment(orderId);
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/payments?page=0&size=20&paymentStatus=PAID&settlementStatus=SETTLED
     * Returns paginated list of all payments with optional status filters.
     */
    @GetMapping
    public ResponseEntity<Page<PaymentResponse>> getAllPayments(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String paymentStatus,
            @RequestParam(required = false) String settlementStatus) {

        Page<PaymentResponse> payments = paymentService.getAllPayments(page, size, paymentStatus, settlementStatus);
        return ResponseEntity.ok(payments);
    }
}
