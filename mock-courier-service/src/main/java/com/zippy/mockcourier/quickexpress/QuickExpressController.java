package com.zippy.mockcourier.quickexpress;

import com.zippy.mockcourier.common.MockShipmentStore;
import com.zippy.mockcourier.quickexpress.dto.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/quickexpress")
public class QuickExpressController {

    private final MockShipmentStore mockShipmentStore;

    public QuickExpressController(MockShipmentStore mockShipmentStore) {
        this.mockShipmentStore = mockShipmentStore;
    }

    @PostMapping("/rates/check")
    public ResponseEntity<?> checkRates(
            @RequestBody QuickExpressRateRequest request,
            @RequestParam(name = "fail", required = false, defaultValue = "false") boolean fail,
            @RequestParam(name = "delay", required = false, defaultValue = "0") long delayMs) throws InterruptedException {

        if (delayMs > 0) {
            Thread.sleep(delayMs);
        }

        if (fail) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("QuickExpress Internal Server Error");
        }

        String quoteId = mockShipmentStore.generateQuickExpressQuoteId();
        QuickExpressRateResponse.Charges charges = new QuickExpressRateResponse.Charges(
                new BigDecimal("115.00"),
                new BigDecimal("40.00"),
                new BigDecimal("12.00"),
                new BigDecimal("30.06")
        );
        QuickExpressRateResponse.DeliveryEstimate estimate = new QuickExpressRateResponse.DeliveryEstimate(2, 3);

        QuickExpressRateResponse response = new QuickExpressRateResponse(
                "AVAILABLE",
                quoteId,
                charges,
                new BigDecimal("197.06"),
                estimate,
                "EXPRESS"
        );

        return ResponseEntity.ok(response);
    }

    @PostMapping("/booking/create")
    public ResponseEntity<?> createBooking(
            @RequestBody QuickExpressShipmentRequest request,
            @RequestParam(name = "fail", required = false, defaultValue = "false") boolean fail,
            @RequestParam(name = "delay", required = false, defaultValue = "0") long delayMs) throws InterruptedException {

        if (delayMs > 0) {
            Thread.sleep(delayMs);
        }

        if (fail) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("QuickExpress Booking Creation Failed");
        }

        MockShipmentStore.MockShipmentRecord record = mockShipmentStore.createQuickExpressShipment(
                request.getClientOrderId(),
                request.getProductType(),
                request.getWebhook()
        );

        QuickExpressShipmentResponse.Booking booking = new QuickExpressShipmentResponse.Booking(
                record.shipmentId(),
                record.trackingNumber(),
                "SHIPMENT_CREATED"
        );

        QuickExpressShipmentResponse response = new QuickExpressShipmentResponse("CONFIRMED", booking);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
