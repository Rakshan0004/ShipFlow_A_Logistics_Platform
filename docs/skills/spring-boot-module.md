# Skill: Spring Boot Module Conventions

Re-read this before creating any new package, entity, DTO, service, or controller.

---

## Package Structure

Both `zippy-backend` and `mock-courier-service` follow this layout:

```
src/main/java/com/zippy/{module}/
├── {Module}Application.java          // @SpringBootApplication entry point
├── config/                           // @Configuration beans (WebClient, CORS, etc.)
├── controller/                       // @RestController — thin, delegates to service
├── service/                          // @Service — business logic, transaction boundaries
├── adapter/                          // External integrations (courier clients)
│   ├── CourierClient.java            // Interface
│   ├── fastship/                     // One package per courier
│   ├── quickexpress/
│   └── reliable/
├── repository/                       // @Repository — Spring Data JPA interfaces
├── model/                            // @Entity — JPA entities (DB representation)
├── dto/                              // Data Transfer Objects (API representation)
│   ├── request/                      // Incoming request bodies
│   ├── response/                     // Outgoing response bodies
│   └── webhook/                      // Webhook payload DTOs
├── mapper/                           // Entity ↔ DTO conversion
└── exception/                        // Custom exceptions + @ControllerAdvice handler
```

---

## Naming Conventions

| Element | Convention | Example |
|---------|-----------|---------|
| Entity class | Singular noun | `Order`, `Shipment`, `ShipmentEvent` |
| Repository | `{Entity}Repository` | `OrderRepository` |
| Service | `{Domain}Service` | `OrderService`, `RateAggregationService` |
| Controller | `{Domain}Controller` | `OrderController`, `WebhookController` |
| Request DTO | `{Action}{Entity}Request` | `CreateOrderRequest`, `SelectCarrierRequest` |
| Response DTO | `{Entity}Response` | `OrderResponse`, `ShipmentResponse` |
| Mapper | `{Entity}Mapper` | `OrderMapper` |
| Exception | `{Reason}Exception` | `OrderNotFoundException`, `InvalidStatusTransitionException` |
| Test class | `{ClassUnderTest}Test` | `OrderServiceTest`, `FastShipClientTest` |
| Config class | `{Concern}Config` | `WebClientConfig`, `CorsConfig` |

---

## Entity vs DTO Separation

**Entities** (`model/`) are JPA-annotated classes mapped to database tables. They are
**never** exposed directly in API responses.

**DTOs** (`dto/`) are plain POJOs for API communication. They decouple the API surface from
the database schema.

**Mappers** (`mapper/`) convert between entities and DTOs. Use static methods (no MapStruct
for this project — keep it simple):

```java
public class OrderMapper {

    public static Order toEntity(CreateOrderRequest request) {
        Order order = new Order();
        order.setMerchantOrderId(request.getMerchantOrderId());
        order.setCustomerName(request.getCustomer().getName());
        // ... map all fields
        return order;
    }

    public static OrderResponse toResponse(Order order) {
        OrderResponse response = new OrderResponse();
        response.setOrderId(order.getZippyOrderId());
        // ... map all fields
        return response;
    }
}
```

---

## Entity Conventions

```java
@Entity
@Table(name = "orders")
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "zippy_order_id", nullable = false, unique = true)
    private String zippyOrderId;

    // Use @Column for every field — explicit is better than magic
    // Use @Enumerated(EnumType.STRING) for enum fields — never ORDINAL
    // Use Instant or LocalDateTime for timestamps, never java.util.Date

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
        updatedAt = Instant.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = Instant.now();
    }
}
```

**Rules:**
- Table names are **plural** (`orders`, `shipments`, `shipment_events`)
- Column names are **snake_case** (matching Flyway migration scripts)
- Use `@Column` annotations on every field for explicitness
- Use `IDENTITY` generation strategy (works with both H2 and PostgreSQL)
- Timestamps use `Instant` (UTC by default)

---

## DTO Conventions

```java
public class CreateOrderRequest {

    @NotBlank(message = "Merchant order ID is required")
    private String merchantOrderId;

    @NotNull(message = "Customer details are required")
    @Valid
    private CustomerDto customer;

    // Use @NotBlank, @NotNull, @Min, @Max, @Pattern for validation
    // Validation annotations on DTOs, not entities
    // Use @Valid on nested objects to trigger recursive validation
}
```

**Rules:**
- Use `javax.validation` / `jakarta.validation` annotations on request DTOs
- Response DTOs have no validation annotations
- Use `@JsonProperty` only when JSON field name differs from Java field name
- All monetary amounts use `BigDecimal`, never `double`

---

## Controller Conventions

```java
@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    // Constructor injection — no @Autowired annotation
    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping
    public ResponseEntity<OrderResponse> createOrder(
            @Valid @RequestBody CreateOrderRequest request) {
        OrderResponse response = orderService.createOrder(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
```

**Rules:**
- Controllers are **thin** — no business logic, only: parse request → call service → build response
- Use `@Valid` on `@RequestBody` for automatic validation
- Return `ResponseEntity<T>` with explicit status codes
- Use constructor injection (not field injection with `@Autowired`)

---

## Service Conventions

```java
@Service
@Transactional(readOnly = true)
public class OrderService {

    private final OrderRepository orderRepository;

    public OrderService(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    @Transactional
    public OrderResponse createOrder(CreateOrderRequest request) {
        // Business logic here
    }

    public OrderResponse getOrder(String orderId) {
        Order order = orderRepository.findByZippyOrderId(orderId)
            .orElseThrow(() -> new OrderNotFoundException(orderId));
        return OrderMapper.toResponse(order);
    }
}
```

**Rules:**
- Class-level `@Transactional(readOnly = true)` as default
- Method-level `@Transactional` for write operations
- Throw custom exceptions — let `@ControllerAdvice` handle HTTP mapping
- Services operate on entities internally, accept/return DTOs at boundaries

---

## Exception Handling

```java
@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(OrderNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(OrderNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
            .body(new ErrorResponse("NOT_FOUND", ex.getMessage()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException ex) {
        Map<String, String> details = ex.getBindingResult().getFieldErrors().stream()
            .collect(Collectors.toMap(
                FieldError::getField,
                FieldError::getDefaultMessage,
                (a, b) -> a));
        return ResponseEntity.badRequest()
            .body(new ErrorResponse("VALIDATION_ERROR", "Validation failed", details));
    }
}
```

**Error response shape** (consistent across all endpoints):
```json
{
  "error": "VALIDATION_ERROR",
  "message": "Validation failed",
  "details": { "customerName": "must not be blank" }
}
```

---

## Logging Conventions

- Use `@Slf4j` (Lombok) or `LoggerFactory.getLogger()`
- Log at appropriate levels:
  - `INFO` — business events (order created, shipment created, carrier selected)
  - `WARN` — recoverable failures (courier down, unknown tracking number, invalid transition)
  - `ERROR` — unexpected failures (DB errors, unhandled exceptions)
  - `DEBUG` — duplicate webhooks, detailed flow tracing
- Include context: `log.info("Order created: orderId={}", order.getZippyOrderId())`
