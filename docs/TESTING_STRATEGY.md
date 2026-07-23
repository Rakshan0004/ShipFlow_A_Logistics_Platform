# Testing Strategy — Zippy Mock Logistics Platform

## Test Stack

| Tool | Purpose |
|------|---------|
| JUnit 5 | Test framework |
| Mockito | Mocking dependencies in unit tests |
| `@WebMvcTest` | Controller layer tests (Spring MVC slice) |
| `@DataJpaTest` | Repository layer tests (JPA slice with H2) |
| `@SpringBootTest` | Full integration tests |
| AssertJ | Fluent assertions |
| Jackson `ObjectMapper` | JSON fixture loading |

---

## Spec Testing Requirements → Test Mapping

Each item from the spec's "Testing Expectations" section, mapped to a test class, type, and
layer.

| # | Spec Requirement | Test Class | Type | Layer |
|---|------------------|------------|------|-------|
| 1 | Order creation | `OrderServiceTest` | Unit | Service |
| 1b | Order creation (API) | `OrderControllerTest` | Integration | Controller (`@WebMvcTest`) |
| 1c | Order validation | `OrderServiceTest` | Unit | Service |
| 2 | Courier-response normalization | `FastShipClientTest`, `QuickExpressClientTest`, `ReliableCourierClientTest` | Unit | Adapter |
| 3 | Rate sorting | `RateAggregationServiceTest` | Unit | Service |
| 4 | One courier failing | `RateAggregationServiceTest` | Unit | Service |
| 5 | Carrier selection | `CarrierSelectionServiceTest` | Unit | Service |
| 5b | Carrier selection (API) | `CarrierSelectionControllerTest` | Integration | Controller (`@WebMvcTest`) |
| 6 | Shipment creation | `ShipmentServiceTest` | Unit | Service |
| 6b | Shipment creation (API) | `ShipmentControllerTest` | Integration | Controller (`@WebMvcTest`) |
| 7 | Webhook status mapping | `FastShipClientTest`, `QuickExpressClientTest`, `ReliableCourierClientTest` | Unit | Adapter |
| 8 | Duplicate webhook handling | `WebhookProcessingServiceTest` | Unit + Integration | Service |
| 9 | Invalid status transition | `WebhookProcessingServiceTest` | Unit | Service |

---

## Test Details by Class

### `OrderServiceTest` (Unit)

| Test Method | What It Verifies |
|-------------|------------------|
| `shouldCreateOrderWithGeneratedZippyId()` | ID format `ZPY-ORD-{seq}`, status = `ORDER_CREATED` |
| `shouldRejectOrderWithMissingCustomerName()` | Validation error for required fields |
| `shouldRejectOrderWithNegativeWeight()` | Validation error for invalid weight |
| `shouldRejectCodOrderWithoutCodAmount()` | `paymentType=COD` requires `codAmount > 0` |
| `shouldRejectOrderWithInvalidPincode()` | Pincode format validation |
| `shouldReturnOrderById()` | Retrieves persisted order correctly |
| `shouldReturn404ForNonExistentOrder()` | `OrderNotFoundException` thrown |

### `OrderControllerTest` (`@WebMvcTest`)

| Test Method | What It Verifies |
|-------------|------------------|
| `shouldReturn201OnValidOrderCreation()` | HTTP 201 + response body |
| `shouldReturn400OnInvalidOrder()` | HTTP 400 + validation error details |
| `shouldReturn404ForUnknownOrderId()` | HTTP 404 |

### `FastShipClientTest` (Unit)

| Test Method | What It Verifies |
|-------------|------------------|
| `shouldMapRateResponseToNormalizedFormat()` | All fields mapped per COURIER_NORMALIZATION.md |
| `shouldMapWebhookEventToNormalizedEvent()` | `event_code` → Zippy status |
| `shouldConvertWeightFromGramsToKg()` | `1500g → 1.5kg` in request |
| `shouldSetSameMinMaxDaysForSingleEstimate()` | `estimated_days: 2` → min=2, max=2 |
| `shouldThrowOnFailedResponse()` | `success: false` → `CourierUnavailableException` |

### `QuickExpressClientTest` (Unit)

| Test Method | What It Verifies |
|-------------|------------------|
| `shouldMapRateResponseToNormalizedFormat()` | Including `fuelSurcharge → additionalCharges` |
| `shouldMapWebhookEventToNormalizedEvent()` | `OFD → OUT_FOR_DELIVERY`, `SC → SHIPMENT_CREATED`, etc. |
| `shouldPreserveQuoteIdInRawResponse()` | `quoteId` available for shipment creation |
| `shouldMapAllEventTypesToZippyStatus()` | SC, PU, IT, OFD, DLV all mapped correctly |
| `shouldThrowOnUnavailableStatus()` | `status: "UNAVAILABLE"` → `CourierUnavailableException` |

### `ReliableCourierClientTest` (Unit)

| Test Method | What It Verifies |
|-------------|------------------|
| `shouldMapMultipleServiceOptionsToNormalizedFormat()` | Both RC-SURFACE and RC-AIR mapped |
| `shouldParseEtaRange()` | `"4-5 business days"` → min=4, max=5 |
| `shouldMapWebhookEventToNormalizedEvent()` | `statusId: 50 → DELIVERED`, `60 → DELIVERY_FAILED`, etc. |
| `shouldMapStatusIdToZippyStatus()` | All 7 status IDs mapped |
| `shouldConvertWeightForShipmentRequest()` | Grams → KG for PUT request |
| `shouldThrowOnNon200Code()` | `code: 500` → `CourierUnavailableException` |

### `RateAggregationServiceTest` (Unit)

| Test Method | What It Verifies |
|-------------|------------------|
| `shouldAggregateRatesFromAllCouriers()` | Happy path — 4 options (FS×1, QE×1, RC×2) |
| `shouldReturnPartialRatesWhenOneCourierFails()` | One courier 500 → others returned + warning |
| `shouldReturnPartialRatesWhenOneCourierTimesOut()` | One courier slow → timeout → partial results |
| `shouldReturnEmptyOptionsWhenAllCouriersFail()` | All fail → empty list + 3 warnings |
| `shouldSortRatesByTotalCharge()` | Cheapest first |
| `shouldSortRatesByEstimatedDelivery()` | Fastest first |
| `shouldPersistQuotesToDatabase()` | Quotes saved in `shipping_quotes` |

### `CarrierSelectionServiceTest` (Unit)

| Test Method | What It Verifies |
|-------------|------------------|
| `shouldSelectCarrierAndFreezeQuote()` | Status → `CARRIER_SELECTED`, `quoted_amount` set |
| `shouldRejectSelectionWhenQuoteNotFound()` | No matching quote → error |
| `shouldRejectSelectionWhenAmountMismatch()` | `quotedAmount` ≠ stored quote → 422 |
| `shouldRejectSelectionWhenAlreadySelected()` | Status already `CARRIER_SELECTED` → 409 |
| `shouldFreezeQuotedAmountOnSelection()` | `quoted_amount` doesn't change on re-quoting |

### `ShipmentServiceTest` (Unit)

| Test Method | What It Verifies |
|-------------|------------------|
| `shouldCreateShipmentWithCorrectCourier()` | Calls correct `CourierClient.createShipment()` |
| `shouldStoreCarrierShipmentIdAndTracking()` | `carrier_shipment_id`, `tracking_number` persisted |
| `shouldSetStatusToShipmentCreated()` | Both order and shipment status updated |
| `shouldRejectShipmentWhenNoCarrierSelected()` | Status not `CARRIER_SELECTED` → 422 |
| `shouldRejectDuplicateShipment()` | Shipment already exists → 409 |
| `shouldHandleCourierShipmentCreationFailure()` | Courier API fails → 502, no shipment created |

### `WebhookProcessingServiceTest` (Unit + Integration)

| Test Method | What It Verifies |
|-------------|------------------|
| `shouldProcessValidWebhookEvent()` | Event persisted, status updated |
| `shouldIgnoreDuplicateWebhookEvent()` | Same event twice → one record |
| `shouldHandleUnknownTrackingNumber()` | Unknown shipment → log + 200 |
| `shouldRejectInvalidStatusTransition()` | `DELIVERED → IN_TRANSIT` rejected |
| `shouldUpdateCurrentStatusOnValidEvent()` | `current_status` updated on shipment |
| `shouldMaintainStatusHistory()` | Multiple events → ordered history |
| `shouldHandleConcurrentWebhookEvents()` | Integration test with concurrent threads |

### `WebhookControllerTest` (`@WebMvcTest`)

| Test Method | What It Verifies |
|-------------|------------------|
| `shouldAcceptValidFastShipWebhook()` | HTTP 200 for valid FastShip payload |
| `shouldAcceptValidQuickExpressWebhook()` | HTTP 200 for valid QE payload |
| `shouldAcceptValidReliableCourierWebhook()` | HTTP 200 for valid RC payload |
| `shouldReturn400ForMalformedPayload()` | Missing required fields → 400 |

---

## Test Data / Fixtures Approach

### Strategy: JSON Fixtures + Builder Pattern

Test data is managed via:

1. **JSON fixture files** in `src/test/resources/fixtures/`:
   ```
   fixtures/
   ├── orders/
   │   ├── valid-cod-order.json
   │   └── valid-prepaid-order.json
   ├── courier-responses/
   │   ├── fastship-rate-response.json
   │   ├── quickexpress-rate-response.json
   │   ├── reliable-rate-response.json
   │   ├── fastship-shipment-response.json
   │   ├── quickexpress-shipment-response.json
   │   └── reliable-shipment-response.json
   └── webhooks/
       ├── fastship-in-transit.json
       ├── quickexpress-ofd.json
       └── reliable-delivered.json
   ```

2. **Test data builders** for entities:
   ```java
   public class TestOrderBuilder {
       public static Order codOrder() { ... }
       public static Order prepaidOrder() { ... }
       public static CreateOrderRequest validCodRequest() { ... }
   }
   ```

3. **Fixture loader utility:**
   ```java
   public class TestFixtures {
       public static <T> T load(String path, Class<T> type) {
           InputStream is = TestFixtures.class.getResourceAsStream("/fixtures/" + path);
           return objectMapper.readValue(is, type);
       }
   }
   ```

---

## Test Coverage Targets

| Layer | Target | Rationale |
|-------|--------|-----------|
| Service | 90%+ | Core business logic — highest priority |
| Adapter | 90%+ | Normalization correctness is critical |
| Controller | Key endpoints | HTTP status codes, validation, error handling |
| Repository | Via integration tests | Covered by `@DataJpaTest` and `@SpringBootTest` |
| Frontend | Manual verification | React component testing is bonus scope |

---

## Running Tests

```bash
# All tests
./gradlew test

# Specific module
./gradlew :zippy-backend:test

# Specific test class
./gradlew :zippy-backend:test --tests "com.zippy.backend.service.RateAggregationServiceTest"

# With coverage report
./gradlew :zippy-backend:test jacocoTestReport
```
