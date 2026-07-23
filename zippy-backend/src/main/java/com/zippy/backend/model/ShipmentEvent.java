package com.zippy.backend.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "shipment_events", uniqueConstraints = {
    @UniqueConstraint(name = "idx_shipment_events_idempotency", columnNames = {"shipment_id", "carrier_event_id"})
})
public class ShipmentEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "shipment_id", nullable = false)
    private Shipment shipment;

    @Column(name = "carrier_event_id", length = 100)
    private String carrierEventId;

    @Column(name = "carrier_status", nullable = false, length = 50)
    private String carrierStatus;

    @Column(name = "normalized_status", nullable = false, length = 30)
    private String normalizedStatus;

    @Column(name = "description", length = 500)
    private String description;

    @Column(name = "location", length = 200)
    private String location;

    @Column(name = "event_time", nullable = false)
    private Instant eventTime;

    @Column(name = "raw_event_payload", columnDefinition = "TEXT")
    private String rawEventPayload;

    @Column(name = "received_at", nullable = false, updatable = false)
    private Instant receivedAt;

    public ShipmentEvent() {
    }

    @PrePersist
    protected void onCreate() {
        if (receivedAt == null) {
            receivedAt = Instant.now();
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Shipment getShipment() {
        return shipment;
    }

    public void setShipment(Shipment shipment) {
        this.shipment = shipment;
    }

    public String getCarrierEventId() {
        return carrierEventId;
    }

    public void setCarrierEventId(String carrierEventId) {
        this.carrierEventId = carrierEventId;
    }

    public String getCarrierStatus() {
        return carrierStatus;
    }

    public void setCarrierStatus(String carrierStatus) {
        this.carrierStatus = carrierStatus;
    }

    public String getNormalizedStatus() {
        return normalizedStatus;
    }

    public void setNormalizedStatus(String normalizedStatus) {
        this.normalizedStatus = normalizedStatus;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public Instant getEventTime() {
        return eventTime;
    }

    public void setEventTime(Instant eventTime) {
        this.eventTime = eventTime;
    }

    public String getRawEventPayload() {
        return rawEventPayload;
    }

    public void setRawEventPayload(String rawEventPayload) {
        this.rawEventPayload = rawEventPayload;
    }

    public Instant getReceivedAt() {
        return receivedAt;
    }

    public void setReceivedAt(Instant receivedAt) {
        this.receivedAt = receivedAt;
    }
}
