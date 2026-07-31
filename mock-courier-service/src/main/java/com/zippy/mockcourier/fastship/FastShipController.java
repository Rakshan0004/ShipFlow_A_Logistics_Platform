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

        BigDecimal weightKg = request.getWeightKg() != null ? BigDecimal.valueOf(request.getWeightKg()) : new BigDecimal("1.0");
        BigDecimal invoiceValue = request.getInvoiceValue() != null ? request.getInvoiceValue() : BigDecimal.ZERO;
        
        // Base Freight: 80 per Kg
        BigDecimal baseFreight = weightKg.multiply(new BigDecimal("80.00")).setScale(2, java.math.RoundingMode.HALF_UP);
        
        // COD Charge: 2% of invoice value if COD, else 0
        BigDecimal codCharge = BigDecimal.ZERO;
        if ("COD".equalsIgnoreCase(request.getPaymentMode())) {
            codCharge = invoiceValue.multiply(new BigDecimal("0.02")).setScale(2, java.math.RoundingMode.HALF_UP);
        }
        
        // Fuel Surcharge: 10% of base freight
        BigDecimal fuelSurcharge = baseFreight.multiply(new BigDecimal("0.10")).setScale(2, java.math.RoundingMode.HALF_UP);
        
        // Tax: 18% GST on all charges
        BigDecimal taxableAmount = baseFreight.add(codCharge).add(fuelSurcharge);
        BigDecimal tax = taxableAmount.multiply(new BigDecimal("0.18")).setScale(2, java.math.RoundingMode.HALF_UP);
        
        // Total
        BigDecimal totalCharge = taxableAmount.add(tax);

        FastShipRateResponse.ServiceDetail service = new FastShipRateResponse.ServiceDetail(
                "FAST-AIR",
                "FastShip Air Express",
                baseFreight.add(fuelSurcharge), // Combine base + fuel into freightCharge
                codCharge,
                tax,
                totalCharge,
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
