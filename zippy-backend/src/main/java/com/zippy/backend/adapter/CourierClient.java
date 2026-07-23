package com.zippy.backend.adapter;

import com.zippy.backend.dto.NormalizedShipmentEvent;
import com.zippy.backend.dto.NormalizedShippingOption;
import com.zippy.backend.dto.ShipmentCreationResult;
import com.zippy.backend.model.Order;
import com.zippy.backend.model.ShippingQuote;

import java.util.List;
import java.util.Optional;

public interface CourierClient {

    String getCarrierCode();

    String getCarrierName();

    List<NormalizedShippingOption> getRates(Order order);

    default ShipmentCreationResult createShipment(Order order, ShippingQuote selectedQuote) {
        throw new UnsupportedOperationException("Shipment creation not implemented yet for " + getCarrierCode());
    }

    default Optional<NormalizedShipmentEvent> parseWebhookEvent(String rawPayload) {
        throw new UnsupportedOperationException("Webhook parsing not implemented yet for " + getCarrierCode());
    }
}
