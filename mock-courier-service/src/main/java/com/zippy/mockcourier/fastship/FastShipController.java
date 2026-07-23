package com.zippy.mockcourier.fastship;

import com.zippy.mockcourier.common.MockShipmentStore;
import com.zippy.mockcourier.fastship.dto.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/fastship/api/v1")
public class FastShipController {

    private final MockShipmentStore mockShipmentStore;

    public FastShipController(MockShipmentStore mockShipmentStore) {
        this.mockShipmentStore = mockShipmentStore;
    }

    @PostMapping("/rate")
    public ResponseEntity<?> getRate(
            @RequestBody FastShipRateRequest request,
            @RequestParam(name = "fail", required = false, defaultValue = "false") boolean fail,
            @RequestParam(name = "delay", required = false, defaultValue = "0") long delayMs) throws InterruptedException {

        if (delayMs > 0) {
            Thread.sleep(delayMs);
        }

        if (fail) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("FastShip Internal Server Error");
        }

        FastShipRateResponse.ServiceDetail service = new FastShipRateResponse.ServiceDetail(
                "FAST-AIR",
                "FastShip Air Express",
                new BigDecimal("120.00"),
                new BigDecimal("35.00"),
                new BigDecimal("27.90"),
                new BigDecimal("182.90"),
                2
        );

        FastShipRateResponse response = new FastShipRateResponse(true, service);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/shipments")
    public ResponseEntity<?> createShipment(
            @RequestBody FastShipShipmentRequest request,
            @RequestParam(name = "fail", required = false, defaultValue = "false") boolean fail,
            @RequestParam(name = "delay", required = false, defaultValue = "0") long delayMs) throws InterruptedException {

        if (delayMs > 0) {
            Thread.sleep(delayMs);
        }

        if (fail) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("FastShip Shipment Creation Failed");
        }

        MockShipmentStore.MockShipmentRecord record = mockShipmentStore.createFastShipment(
                request.getReferenceNumber(),
                request.getServiceCode(),
                request.getCallbackUrl()
        );

        FastShipShipmentResponse response = new FastShipShipmentResponse(
                true,
                record.shipmentId(),
                record.trackingNumber(),
                "http://mock-fastship/labels/" + record.trackingNumber() + ".pdf",
                "BOOKED"
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
