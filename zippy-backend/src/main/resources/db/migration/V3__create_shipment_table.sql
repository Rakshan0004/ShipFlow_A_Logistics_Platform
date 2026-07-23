CREATE TABLE shipments (
    id                    BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    order_id              BIGINT         NOT NULL UNIQUE REFERENCES orders(id),
    carrier_code          VARCHAR(30)    NOT NULL,
    carrier_shipment_id   VARCHAR(50),
    tracking_number       VARCHAR(50)    UNIQUE,
    selected_service_code VARCHAR(30)    NOT NULL,
    quoted_amount         DECIMAL(12, 2) NOT NULL,
    current_status        VARCHAR(30)    NOT NULL DEFAULT 'SHIPMENT_CREATED',
    created_at            TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at            TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_shipments_tracking_number ON shipments(tracking_number);
CREATE INDEX idx_shipments_carrier_shipment_id ON shipments(carrier_shipment_id);
