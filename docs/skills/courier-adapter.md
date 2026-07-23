# Skill: Adding a New Courier Adapter

Re-read this checklist before implementing or modifying any `CourierClient`.

---

## Prerequisites

- The courier's API contract is fully documented in `API_CONTRACTS.md`
- The normalization mapping is defined in `COURIER_NORMALIZATION.md`
- The courier's webhook format is documented in `API_CONTRACTS.md`

---

## Checklist

### 1. Create the adapter package

```
zippy-backend/src/main/java/com/zippy/backend/adapter/{couriername}/
├── {CourierName}Client.java          // implements CourierClient
├── {CourierName}Config.java          // base URL, timeout overrides
└── dto/
    ├── {CourierName}RateRequest.java
    ├── {CourierName}RateResponse.java
    ├── {CourierName}ShipmentRequest.java
    ├── {CourierName}ShipmentResponse.java
    └── {CourierName}WebhookPayload.java
```

### 2. Implement `CourierClient` interface

```java
@Component
public class {CourierName}Client implements CourierClient {

    @Override
    public String getCarrierCode() { return "{CARRIER_CODE}"; }

    @Override
    public String getCarrierName() { return "{Carrier Name}"; }

    @Override
    public List<NormalizedShippingOption> getRates(Order order) {
        // 1. Map Order → courier-specific request DTO
        // 2. Call courier API via WebClient (with timeout)
        // 3. Map courier response → List<NormalizedShippingOption>
        // 4. On failure → throw CourierUnavailableException
    }

    @Override
    public ShipmentCreationResult createShipment(Order order, ShippingQuote quote) {
        // 1. Map Order + Quote → courier-specific shipment request DTO
        // 2. Call courier API via WebClient
        // 3. Map response → ShipmentCreationResult
        // 4. On failure → throw CourierUnavailableException
    }

    @Override
    public Optional<NormalizedShipmentEvent> parseWebhookEvent(String rawPayload) {
        // 1. Deserialize JSON → courier-specific webhook DTO
        // 2. Map carrier status → Zippy normalized status
        // 3. Build NormalizedShipmentEvent
        // 4. Return Optional.empty() if payload is malformed
    }
}
```

### 3. Handle unit conversions

| Field | Check |
|-------|-------|
| Weight | Order stores grams. Does this courier expect grams or KG? Convert if needed. |
| Dimensions | Order stores cm. Does this courier use cm, mm, or inches? |
| ETA | Does the courier return a range or a single value? Handle both. |

### 4. Handle error/timeout

```java
private <T> T callCourier(String url, Object request, Class<T> responseType) {
    try {
        return webClient.post()
            .uri(url)
            .bodyValue(request)
            .retrieve()
            .bodyToMono(responseType)
            .block(Duration.ofSeconds(TIMEOUT_SECONDS));
    } catch (WebClientResponseException e) {
        log.warn("Courier {} returned HTTP {}", getCarrierCode(), e.getStatusCode());
        throw new CourierUnavailableException(getCarrierCode(), e);
    } catch (Exception e) {
        log.warn("Courier {} call failed: {}", getCarrierCode(), e.getMessage());
        throw new CourierUnavailableException(getCarrierCode(), e);
    }
}
```

### 5. Write the mapping function

Follow the exact field mapping from `COURIER_NORMALIZATION.md`. Every field must be mapped —
no nulls allowed in `NormalizedShippingOption` except where documented.

### 6. Write tests

Create `{CourierName}ClientTest` with at minimum:

- [ ] `shouldMapRateResponseToNormalizedFormat()` — happy path
- [ ] `shouldMapWebhookEventToNormalizedEvent()` — happy path
- [ ] `shouldHandleUnitConversions()` — weight/dimension
- [ ] `shouldMapAllStatusCodesToZippyStatus()` — all status values
- [ ] `shouldThrowOnFailedResponse()` — error response from courier

### 7. Register the webhook route

Add to `WebhookController`:
```java
@PostMapping("/api/webhooks/{couriername}")
public ResponseEntity<Map<String, String>> handle{CourierName}Webhook(
        @RequestBody String rawPayload) {
    webhookProcessingService.processWebhook("{CARRIER_CODE}", rawPayload);
    return ResponseEntity.ok(Map.of("status", "ACCEPTED"));
}
```

### 8. Add mock courier endpoint

In `mock-courier-service`, create the corresponding mock endpoints matching the API contract.

### 9. Update docs

- [ ] `API_CONTRACTS.md` — add endpoint definitions
- [ ] `COURIER_NORMALIZATION.md` — add mapping tables
- [ ] `EDGE_CASES_AND_FAILURE_HANDLING.md` — add any courier-specific edge cases
- [ ] `TESTING_STRATEGY.md` — add test class entry
