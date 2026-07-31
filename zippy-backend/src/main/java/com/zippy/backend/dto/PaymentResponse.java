package com.zippy.backend.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

public class PaymentResponse {

    private Long paymentId;
    private String orderId;
    private String merchantOrderId;
    private String customerName;

    private String transactionId;
    private String invoiceNumber;

    private BigDecimal orderAmount;
    private BigDecimal shippingCharges;
    private BigDecimal tax;
    private BigDecimal totalAmount;

    private String paymentMethod;
    private String paymentStatus;
    private String settlementStatus;
    private LocalDate settlementDate;

    private Instant createdAt;
    private Instant updatedAt;

    public PaymentResponse() {
    }

    // Getters and Setters

    public Long getPaymentId() { return paymentId; }
    public void setPaymentId(Long paymentId) { this.paymentId = paymentId; }

    public String getOrderId() { return orderId; }
    public void setOrderId(String orderId) { this.orderId = orderId; }

    public String getMerchantOrderId() { return merchantOrderId; }
    public void setMerchantOrderId(String merchantOrderId) { this.merchantOrderId = merchantOrderId; }

    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }

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
