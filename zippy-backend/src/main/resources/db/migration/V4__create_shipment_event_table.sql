CREATE TABLE shipment_events (
    id                 BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    shipment_id        BIGINT       NOT NULL REFERENCES shipments(id),
    carrier_event_id   VARCHAR(100),
    carrier_status     VARCHAR(50)  NOT NULL,
    normalized_status  VARCHAR(30)  NOT NULL,
    description        VARCHAR(500),
    location           VARCHAR(200),
    event_time         TIMESTAMP    NOT NULL,
    raw_event_payload  TEXT,
    received_at        TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_shipment_events_shipment_id ON shipment_events(shipment_id);
CREATE UNIQUE INDEX idx_shipment_events_idempotency
    ON shipment_events(shipment_id, carrier_event_id)
    WHERE carrier_event_id IS NOT NULL;
