package com.zippy.mockcourier.reliable;

import com.zippy.mockcourier.common.MockShipmentStore;
import com.zippy.mockcourier.reliable.dto.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/reliablecourier")
public class ReliableCourierController {

    private final MockShipmentStore mockShipmentStore;

    public ReliableCourierController(MockShipmentStore mockShipmentStore) {
        this.mockShipmentStore = mockShipmentStore;
    }

    @GetMapping("/shipping-options")
    public ResponseEntity<?> getShippingOptions(
            @RequestParam(name = "from", required = false) String from,
            @RequestParam(name = "to", required = false) String to,
            @RequestParam(name = "weight", required = false) Integer weight,
            @RequestParam(name = "cod", required = false) Boolean cod,
            @RequestParam(name = "amount", required = false) BigDecimal amount,
            @RequestParam(name = "fail", required = false, defaultValue = "false") boolean fail,
            @RequestParam(name = "delay", required = false, defaultValue = "0") long delayMs) throws InterruptedException {

        if (delayMs > 0) {
            Thread.sleep(delayMs);
        }

        if (fail) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("ReliableCourier Internal Server Error");
        }

        BigDecimal weightKg = (weight != null && weight > 0) ? BigDecimal.valueOf(weight).divide(new BigDecimal("1000")) : new BigDecimal("1.0");
        boolean isCod = cod != null ? cod : false;
        
        // --- Surface ---
        BigDecimal surfaceBase = weightKg.multiply(new BigDecimal("75.00")).setScale(2, java.math.RoundingMode.HALF_UP);
        BigDecimal surfaceCodFee = isCod ? new BigDecimal("30.00") : BigDecimal.ZERO;
        BigDecimal surfaceFuel = new BigDecimal("10.00");
        BigDecimal surfaceTaxable = surfaceBase.add(surfaceCodFee).add(surfaceFuel);
        BigDecimal surfaceTax = surfaceTaxable.multiply(new BigDecimal("0.18")).setScale(2, java.math.RoundingMode.HALF_UP);
        BigDecimal surfaceTotal = surfaceTaxable.add(surfaceTax);

        ReliableCourierRateResponse.OptionData surface = new ReliableCourierRateResponse.OptionData(
                "RC-SURFACE",
                "Reliable Surface",
                new ReliableCourierRateResponse.RateDetail(
                        surfaceBase,
                        surfaceFuel,
                        surfaceCodFee,
                        surfaceTax,
                        surfaceTotal
                ),
                "4-5 business days"
        );

        // --- Air ---
        BigDecimal airBase = weightKg.multiply(new BigDecimal("125.00")).setScale(2, java.math.RoundingMode.HALF_UP);
        BigDecimal airCodFee = isCod ? new BigDecimal("40.00") : BigDecimal.ZERO;
        BigDecimal airFuel = new BigDecimal("15.00");
        BigDecimal airTaxable = airBase.add(airCodFee).add(airFuel);
        BigDecimal airTax = airTaxable.multiply(new BigDecimal("0.18")).setScale(2, java.math.RoundingMode.HALF_UP);
        BigDecimal airTotal = airTaxable.add(airTax);

        ReliableCourierRateResponse.OptionData air = new ReliableCourierRateResponse.OptionData(
                "RC-AIR",
                "Reliable Air",
                new ReliableCourierRateResponse.RateDetail(
                        airBase,
                        airFuel,
                        airCodFee,
                        airTax,
                        airTotal
                ),
                "2-3 business days"
        );

        ReliableCourierRateResponse response = new ReliableCourierRateResponse(200, List.of(surface, air));
        return ResponseEntity.ok(response);
    }

    @PutMapping("/orders")
    public ResponseEntity<?> createOrder(
            @RequestBody ReliableCourierShipmentRequest request,
            @RequestParam(name = "fail", required = false, defaultValue = "false") boolean fail,
            @RequestParam(name = "delay", required = false, defaultValue = "0") long delayMs) throws InterruptedException {

        if (delayMs > 0) {
            Thread.sleep(delayMs);
        }

        if (fail) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("ReliableCourier Shipment Creation Failed");
        }

        MockShipmentStore.MockShipmentRecord record = mockShipmentStore.createReliableShipment(
                request.getOrderReference(),
                request.getSelectedOption(),
                request.getStatusNotificationUrl()
        );

        ReliableCourierShipmentResponse.DeliveryOrder deliveryOrder = new ReliableCourierShipmentResponse.DeliveryOrder(
                record.shipmentId(),
                record.trackingNumber()
        );

        ReliableCourierShipmentResponse response = new ReliableCourierShipmentResponse(
                "ACCEPTED",
                deliveryOrder,
                "Shipment successfully registered"
        );

        return ResponseEntity.ok(response);
    }
}
