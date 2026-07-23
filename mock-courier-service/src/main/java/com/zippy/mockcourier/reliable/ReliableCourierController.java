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

        ReliableCourierRateResponse.OptionData surface = new ReliableCourierRateResponse.OptionData(
                "RC-SURFACE",
                "Reliable Surface",
                new ReliableCourierRateResponse.RateDetail(
                        new BigDecimal("95.00"),
                        new BigDecimal("10.00"),
                        new BigDecimal("30.00"),
                        new BigDecimal("24.30"),
                        new BigDecimal("159.30")
                ),
                "4-5 business days"
        );

        ReliableCourierRateResponse.OptionData air = new ReliableCourierRateResponse.OptionData(
                "RC-AIR",
                "Reliable Air",
                new ReliableCourierRateResponse.RateDetail(
                        new BigDecimal("130.00"),
                        new BigDecimal("12.00"),
                        new BigDecimal("30.00"),
                        new BigDecimal("30.96"),
                        new BigDecimal("202.96")
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
