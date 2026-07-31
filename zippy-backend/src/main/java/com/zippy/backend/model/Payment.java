package com.zippy.backend.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "payments")
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "order_id", nullable = false, unique = true)
    private Order order;

    @Column(name = "transaction_id", nullable = false, unique = true, length = 50)
    private String transactionId;

    @Column(name = "invoice_number", nullable = false, unique = true, length = 30)
    private String invoiceNumber;

    @Column(name = "order_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal orderAmount;

    @Column(name = "shipping_charges", nullable = false, precision = 12, scale = 2)
    private BigDecimal shippingCharges;

    @Column(name = "tax", nullable = false, precision = 12, scale = 2)
    private BigDecimal tax;

    @Column(name = "total_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal totalAmount;

    /**
     * COD or PREPAID — mirrors orders.payment_type
     */
    @Column(name = "payment_method", nullable = false, length = 20)
    private String paymentMethod;

    /**
     * PAID | PENDING | FAILED | REFUNDED
     */
    @Column(name = "payment_status", nullable = false, length = 20)
    private String paymentStatus;

    /**
     * PENDING | PROCESSING | SETTLED
     */
    @Column(name = "settlement_status", nullable = false, length = 20)
    private String settlementStatus;

    @Column(name = "settlement_date")
    private LocalDate settlementDate;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    public Payment() {
    }

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) createdAt = Instant.now();
        if (updatedAt == null) updatedAt = Instant.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = Instant.now();
    }

    // Getters and Setters

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Order getOrder() { return order; }
    public void setOrder(Order order) { this.order = order; }

    public String getTransactionId() { return transactionId; }
    public void setTransactionId(String transactionId) { this.transactionId = transactionId; }

    public String getInvoiceNumber() { return invoiceNumber; }
    public void setInvoiceNumber(String invoiceNumber) { this.invoiceNumber = invoiceNumber; }

    public BigDecimal getOrderAmount() { return orderAmount; }
    public void setOrderAmount(BigDecimal orderAmount) { this.orderAmount = orderAmount; }

    public BigDecimal getShippingCharges() { return shippingCharges; }
    public void setShippingCharges(BigDecimal shippingCharges) { this.shippingCharges = shippingCharges; }

    public BigDecimal getTax() { return tax; }
    public void setTax(BigDecimal tax) { this.tax = tax; }

    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

    public String getPaymentStatus() { return paymentStatus; }
    public void setPaymentStatus(String paymentStatus) { this.paymentStatus = paymentStatus; }

    public String getSettlementStatus() { return settlementStatus; }
    public void setSettlementStatus(String settlementStatus) { this.settlementStatus = settlementStatus; }

    public LocalDate getSettlementDate() { return settlementDate; }
    public void setSettlementDate(LocalDate settlementDate) { this.settlementDate = settlementDate; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
