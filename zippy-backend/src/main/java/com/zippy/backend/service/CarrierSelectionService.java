package com.zippy.backend.service;

import com.zippy.backend.dto.SelectCarrierRequest;
import com.zippy.backend.dto.SelectCarrierResponse;
import com.zippy.backend.exception.IllegalStateTransitionException;
import com.zippy.backend.exception.OrderNotFoundException;
import com.zippy.backend.exception.PriceMismatchException;
import com.zippy.backend.exception.ValidationException;
import com.zippy.backend.model.Order;
import com.zippy.backend.model.ShippingQuote;
import com.zippy.backend.repository.OrderRepository;
import com.zippy.backend.repository.ShippingQuoteRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@Service
@Transactional(readOnly = true)
public class CarrierSelectionService {

    private final OrderRepository orderRepository;
    private final ShippingQuoteRepository shippingQuoteRepository;

    public CarrierSelectionService(OrderRepository orderRepository,
                                  ShippingQuoteRepository shippingQuoteRepository) {
        this.orderRepository = orderRepository;
        this.shippingQuoteRepository = shippingQuoteRepository;
    }

    @Transactional
    public SelectCarrierResponse selectCarrier(String zippyOrderId, SelectCarrierRequest request) {
        Order order = orderRepository.findByZippyOrderId(zippyOrderId)
                .orElseThrow(() -> new OrderNotFoundException(zippyOrderId));

        if ("SHIPMENT_CREATED".equalsIgnoreCase(order.getOrderStatus())) {
            throw new IllegalStateTransitionException("Cannot change carrier selection after shipment has been created");
        }

        List<ShippingQuote> quotes = shippingQuoteRepository.findByOrderId(order.getId());
        ShippingQuote matchedQuote = quotes.stream()
                .filter(q -> q.getCarrierCode().equalsIgnoreCase(request.getCarrierCode())
                        && q.getServiceCode().equalsIgnoreCase(request.getServiceCode()))
                .findFirst()
                .orElseThrow(() -> new ValidationException("No valid quote found for specified carrier and service",
                        Map.of("carrierCode", request.getCarrierCode(), "serviceCode", request.getServiceCode())));

        if (matchedQuote.getTotalCharge().compareTo(request.getQuotedAmount()) != 0) {
            throw new PriceMismatchException(matchedQuote.getTotalCharge(), request.getQuotedAmount());
        }

        order.setOrderStatus("CARRIER_SELECTED");
        Order savedOrder = orderRepository.save(order);

        SelectCarrierResponse.SelectedCarrierDetail detail = new SelectCarrierResponse.SelectedCarrierDetail(
                matchedQuote.getCarrierCode(),
                matchedQuote.getServiceCode(),
                matchedQuote.getServiceName(),
                matchedQuote.getTotalCharge(),
                Instant.now()
        );

        return new SelectCarrierResponse(savedOrder.getZippyOrderId(), savedOrder.getOrderStatus(), detail);
    }
}
