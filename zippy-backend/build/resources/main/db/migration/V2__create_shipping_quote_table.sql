CREATE TABLE shipping_quotes (
    id                  BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    order_id            BIGINT         NOT NULL REFERENCES orders(id),
    carrier_code        VARCHAR(30)    NOT NULL,
    service_code        VARCHAR(30)    NOT NULL,
    service_name        VARCHAR(100)   NOT NULL,
    base_charge         DECIMAL(12, 2) NOT NULL,
    cod_charge          DECIMAL(12, 2) NOT NULL DEFAULT 0,
    additional_charges  DECIMAL(12, 2) NOT NULL DEFAULT 0,
    tax                 DECIMAL(12, 2) NOT NULL DEFAULT 0,
    total_charge        DECIMAL(12, 2) NOT NULL,
    estimated_min_days  INT            NOT NULL,
    estimated_max_days  INT            NOT NULL,
    raw_carrier_response TEXT,
    created_at          TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_shipping_quotes_order_id ON shipping_quotes(order_id);
