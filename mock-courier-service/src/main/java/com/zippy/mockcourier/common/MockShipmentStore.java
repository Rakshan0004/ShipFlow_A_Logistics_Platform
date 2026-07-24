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

    private final AtomicLong fastShipSeq = new AtomicLong(System.currentTimeMillis() % 1000000L);
    private final AtomicLong fastShipTrackingSeq = new AtomicLong((System.currentTimeMillis() % 100000000L) + (long)(Math.random() * 1000));

    private final AtomicLong quickExpressSeq = new AtomicLong(System.currentTimeMillis() % 1000000L);
    private final AtomicLong quickExpressAwbSeq = new AtomicLong((System.currentTimeMillis() % 100000000L) + (long)(Math.random() * 1000));
    private final AtomicLong quickExpressQuoteSeq = new AtomicLong(System.currentTimeMillis() % 100000L);

    private final AtomicLong reliableSeq = new AtomicLong(System.currentTimeMillis() % 1000000L);
    private final AtomicLong reliableTrackingSeq = new AtomicLong((System.currentTimeMillis() % 100000000L) + (long)(Math.random() * 1000));

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

    public void save(MockShipmentRecord record) {
        if (record.trackingNumber() != null) {
            storeByTracking.put(record.trackingNumber(), record);
        }
        if (record.shipmentId() != null) {
            storeByShipmentId.put(record.shipmentId(), record);
        }
    }
}
