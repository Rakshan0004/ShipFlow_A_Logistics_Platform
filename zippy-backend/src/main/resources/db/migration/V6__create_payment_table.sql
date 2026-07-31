-- V6: Create payments table for tracking payment details per order
CREATE TABLE payments (
    id                BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    order_id          BIGINT         NOT NULL UNIQUE REFERENCES orders(id),
    transaction_id    VARCHAR(50)    NOT NULL UNIQUE,
    invoice_number    VARCHAR(30)    NOT NULL UNIQUE,
    order_amount      DECIMAL(12,2)  NOT NULL,
    shipping_charges  DECIMAL(12,2)  NOT NULL DEFAULT 0.00,
    tax               DECIMAL(12,2)  NOT NULL DEFAULT 0.00,
    total_amount      DECIMAL(12,2)  NOT NULL,
    payment_method    VARCHAR(20)    NOT NULL,
    payment_status    VARCHAR(20)    NOT NULL DEFAULT 'PENDING',
    settlement_status VARCHAR(20)    NOT NULL DEFAULT 'PENDING',
    settlement_date   DATE,
    created_at        TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at        TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_payments_order_id ON payments(order_id);
CREATE INDEX idx_payments_transaction_id ON payments(transaction_id);
CREATE INDEX idx_payments_payment_status ON payments(payment_status);
CREATE INDEX idx_payments_settlement_status ON payments(settlement_status);
