-- Add selected carrier fields to orders table
ALTER TABLE orders
ADD COLUMN selected_carrier_code VARCHAR(30),
ADD COLUMN selected_service_code VARCHAR(30);

-- Add index for better query performance
CREATE INDEX idx_orders_selected_carrier ON orders(selected_carrier_code);
