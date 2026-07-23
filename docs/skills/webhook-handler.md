# Skill: Adding a New Webhook Handler

Re-read this checklist before implementing or modifying any webhook endpoint.

---

## Prerequisites

- The courier's webhook format is documented in `API_CONTRACTS.md`
- The status mapping is defined in `COURIER_NORMALIZATION.md`
- The `CourierClient.parseWebhookEvent()` method exists for this courier

---

## Checklist

### 1. Create the webhook DTO

```java
// In adapter/{couriername}/dto/
public class {CourierName}WebhookPayload {
    // Exact fields from the courier's webhook format
    // Use @JsonProperty for snake_case/camelCase mapping
}
```

### 2. Define the idempotency key

Each courier needs a unique composite key to prevent duplicate events:

| Courier | Key Formula | Example |
|---------|-------------|---------|
| FastShip | `{shipment_id}_{event_code}` | `FS-700001_IN_TRANSIT` |
| QuickExpress | `{awb}_{event.type}` | `QE987654321_OFD` |
| ReliableCourier | `{trackingCode}_{statusId}` | `RC1122334455_50` |

The key is stored in `shipment_events.carrier_event_id` and covered by the unique index
`idx_shipment_events_idempotency`.

### 3. Define the shipment lookup key

Each courier identifies shipments differently:

| Courier | Lookup Field | DB Column |
|---------|-------------|-----------|
| FastShip | `shipment_id` | `shipments.carrier_shipment_id` |
| QuickExpress | `awb` | `shipments.tracking_number` |
| ReliableCourier | `trackingCode` | `shipments.tracking_number` |

### 4. Implement `parseWebhookEvent()` in the `CourierClient`

```java
@Override
public Optional<NormalizedShipmentEvent> parseWebhookEvent(String rawPayload) {
    try {
        var payload = objectMapper.readValue(rawPayload, {CourierName}WebhookPayload.class);
        return Optional.of(NormalizedShipmentEvent.builder()
            .shipmentLookupKey(payload.get{LookupField}())
            .lookupType(ShipmentLookupType.{TRACKING_NUMBER|CARRIER_SHIPMENT_ID})
            .carrierEventId(buildIdempotencyKey(payload))
            .carrierStatus(payload.get{StatusField}())
            .normalizedStatus(mapStatus(payload.get{StatusField}()))
            .description(payload.get{DescriptionField}())
            .location(payload.get{LocationField}())  // may be null
            .eventTime(payload.get{TimeField}())
            .rawPayload(rawPayload)
            .build());
    } catch (Exception e) {
        log.warn("Failed to parse {} webhook: {}", getCarrierCode(), e.getMessage());
        return Optional.empty();
    }
}
```

### 5. Add the webhook endpoint

```java
// In WebhookController
@PostMapping("/api/webhooks/{couriername}")
public ResponseEntity<Map<String, String>> handle{CourierName}Webhook(
        @RequestBody String rawPayload) {
    webhookProcessingService.processWebhook("{CARRIER_CODE}", rawPayload);
    return ResponseEntity.ok(Map.of("status", "ACCEPTED"));
}
```

**Important:** Accept `@RequestBody String` (not the DTO) so the raw payload can be logged
and stored even if parsing fails.

### 6. Webhook processing flow (in `WebhookProcessingService`)

The processing flow is the same for all couriers:

```
1. Find the CourierClient by carrier code
2. Call parseWebhookEvent(rawPayload)
   └── If empty → log WARN, return 200
3. Look up Shipment by lookup key
   └── If not found → log WARN (unknown tracking), return 200
4. Build idempotency key
5. Validate status transition (current_status → new_status)
   └── If invalid → log WARN, return 200 (don't persist)
6. Create ShipmentEvent entity
7. Try to persist (INSERT)
   └── If DataIntegrityViolationException → duplicate, log DEBUG, return 200
8. Update Shipment.current_status + updated_at
9. Return 200
```

### 7. Handle edge cases

| Edge Case | Handling |
|-----------|----------|
| Duplicate event | Caught by unique constraint → 200 |
| Unknown shipment | Log + 200 |
| Invalid transition | Log + 200, don't persist |
| Malformed payload | `parseWebhookEvent()` returns empty → 400 |
| Missing optional fields | Use null (location, proofOfDelivery) |

### 8. Return codes

**Always return 200** for accepted, duplicate, unknown-shipment, and invalid-transition cases.
Only return 400 for genuinely malformed payloads (unparseable JSON, missing required fields).

Rationale: Couriers typically retry on non-2xx. We don't want infinite retry loops.

### 9. Write tests

- [ ] `shouldProcessValidWebhook()` — happy path, event created, status updated
- [ ] `shouldIgnoreDuplicate()` — same event twice → one record
- [ ] `shouldHandleUnknownShipment()` — log + 200, no event
- [ ] `shouldRejectInvalidTransition()` — log + 200, no event
- [ ] `shouldReturn400ForMalformedPayload()` — unparseable JSON

### 10. Add mock courier webhook trigger

In the mock-courier-service, implement the corresponding webhook sender:
```java
// In MockShipmentStore or StatusAdvancementService
public void advanceStatus(String trackingNumber) {
    // 1. Look up mock shipment
    // 2. Advance to next status
    // 3. Build webhook payload in this courier's format
    // 4. POST to Zippy's webhook URL
}
```
