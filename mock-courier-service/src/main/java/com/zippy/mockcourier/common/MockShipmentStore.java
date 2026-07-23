package com.zippy.mockcourier.common;

import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

@Component
public class MockShipmentStore {

    public record MockShipmentRecord(
            String carrierCode,
            String shipmentId,
            String trackingNumber,
            String orderReference,
            String serviceCode,
            String currentStatus,
            String callbackUrl
    ) {}

    private final Map<String, MockShipmentRecord> storeByTracking = new ConcurrentHashMap<>();
    private final Map<String, MockShipmentRecord> storeByShipmentId = new ConcurrentHashMap<>();

    private final AtomicLong fastShipSeq = new AtomicLong(700001L);
    private final AtomicLong fastShipTrackingSeq = new AtomicLong(123456789L);

    private final AtomicLong quickExpressSeq = new AtomicLong(800001L);
    private final AtomicLong quickExpressAwbSeq = new AtomicLong(987654321L);
    private final AtomicLong quickExpressQuoteSeq = new AtomicLong(90001L);

    private final AtomicLong reliableSeq = new AtomicLong(600001L);
    private final AtomicLong reliableTrackingSeq = new AtomicLong(1122334455L);

    public MockShipmentRecord createFastShipment(String orderReference, String serviceCode, String callbackUrl) {
        String shipmentId = "FS-" + fastShipSeq.getAndIncrement();
        String trackingNumber = "FST" + fastShipTrackingSeq.getAndIncrement();
        MockShipmentRecord record = new MockShipmentRecord(
                "FASTSHIP", shipmentId, trackingNumber, orderReference, serviceCode, "BOOKED", callbackUrl
        );
        storeByTracking.put(trackingNumber, record);
        storeByShipmentId.put(shipmentId, record);
        return record;
    }

    public String generateQuickExpressQuoteId() {
        return "QE-Q-" + quickExpressQuoteSeq.getAndIncrement();
    }

    public MockShipmentRecord createQuickExpressShipment(String orderReference, String serviceCode, String webhookUrl) {
        String bookingId = "QE-B-" + quickExpressSeq.getAndIncrement();
        String awb = "QE" + quickExpressAwbSeq.getAndIncrement();
        MockShipmentRecord record = new MockShipmentRecord(
                "QUICKEXPRESS", bookingId, awb, orderReference, serviceCode, "SHIPMENT_CREATED", webhookUrl
        );
        storeByTracking.put(awb, record);
        storeByShipmentId.put(bookingId, record);
        return record;
    }

    public MockShipmentRecord createReliableShipment(String orderReference, String serviceCode, String notificationUrl) {
        String deliveryOrderId = "RC-DO-" + reliableSeq.getAndIncrement();
        String trackingCode = "RC" + reliableTrackingSeq.getAndIncrement();
        MockShipmentRecord record = new MockShipmentRecord(
                "RELIABLE", deliveryOrderId, trackingCode, orderReference, serviceCode, "SHIPMENT_CREATED", notificationUrl
        );
        storeByTracking.put(trackingCode, record);
        storeByShipmentId.put(deliveryOrderId, record);
        return record;
    }

    public Optional<MockShipmentRecord> findByTracking(String trackingNumber) {
        return Optional.ofNullable(storeByTracking.get(trackingNumber));
    }

    public Optional<MockShipmentRecord> findByShipmentId(String shipmentId) {
        return Optional.ofNullable(storeByShipmentId.get(shipmentId));
    }
}
