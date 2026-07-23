package com.zippy.backend.service;

import com.zippy.backend.adapter.CourierClient;
import com.zippy.backend.dto.NormalizedShippingOption;
import com.zippy.backend.dto.RateResponse;
import com.zippy.backend.dto.WarningDto;
import com.zippy.backend.exception.OrderNotFoundException;
import com.zippy.backend.model.Order;
import com.zippy.backend.model.ShippingQuote;
import com.zippy.backend.repository.OrderRepository;
import com.zippy.backend.repository.ShippingQuoteRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class RateAggregationService {

    private static final Logger log = LoggerFactory.getLogger(RateAggregationService.class);
    private static final long COURIER_TIMEOUT_SECONDS = 5;

    private final List<CourierClient> courierClients;
    private final OrderRepository orderRepository;
    private final ShippingQuoteRepository shippingQuoteRepository;

    public RateAggregationService(List<CourierClient> courierClients,
                                  OrderRepository orderRepository,
                                  ShippingQuoteRepository shippingQuoteRepository) {
        this.courierClients = courierClients;
        this.orderRepository = orderRepository;
        this.shippingQuoteRepository = shippingQuoteRepository;
    }

    @Transactional
    public RateResponse fetchAndAggregateRates(String zippyOrderId, String sortBy) {
        Order order = orderRepository.findByZippyOrderId(zippyOrderId)
                .orElseThrow(() -> new OrderNotFoundException(zippyOrderId));

        List<WarningDto> warnings = Collections.synchronizedList(new ArrayList<>());

        List<CompletableFuture<List<NormalizedShippingOption>>> futures = courierClients.stream()
                .map(client -> CompletableFuture.supplyAsync(() -> client.getRates(order))
                        .orTimeout(COURIER_TIMEOUT_SECONDS, TimeUnit.SECONDS)
                        .exceptionally(ex -> {
                            log.warn("Courier {} failed or timed out: {}", client.getCarrierCode(), ex.getMessage());
                            warnings.add(new WarningDto(client.getCarrierCode(), client.getCarrierName() + " is currently unavailable"));
                            return Collections.emptyList();
                        }))
                .toList();

        List<NormalizedShippingOption> allOptions = futures.stream()
                .map(CompletableFuture::join)
                .flatMap(Collection::stream)
                .collect(Collectors.toList());

        sortOptions(allOptions, sortBy);

        // Delete previous quotes for this order and persist new quotes
        shippingQuoteRepository.deleteByOrderId(order.getId());
        for (NormalizedShippingOption opt : allOptions) {
            ShippingQuote quote = new ShippingQuote();
            quote.setOrder(order);
            quote.setCarrierCode(opt.getCarrierCode());
            quote.setServiceCode(opt.getServiceCode());
            quote.setServiceName(opt.getServiceName());
            quote.setBaseCharge(opt.getBaseCharge());
            quote.setCodCharge(opt.getCodCharge());
            quote.setAdditionalCharges(opt.getAdditionalCharges());
            quote.setTax(opt.getTax());
            quote.setTotalCharge(opt.getTotalCharge());
            quote.setEstimatedMinDays(opt.getEstimatedMinDays());
            quote.setEstimatedMaxDays(opt.getEstimatedMaxDays());
            quote.setRawCarrierResponse(opt.getRawCarrierResponse());
            shippingQuoteRepository.save(quote);
        }

        return new RateResponse(zippyOrderId, allOptions, warnings);
    }

    public RateResponse getCachedRates(String zippyOrderId, String sortBy) {
        Order order = orderRepository.findByZippyOrderId(zippyOrderId)
                .orElseThrow(() -> new OrderNotFoundException(zippyOrderId));

        List<ShippingQuote> quotes = shippingQuoteRepository.findByOrderId(order.getId());
        if (quotes.isEmpty()) {
            throw new OrderNotFoundException("No cached rates found for order: " + zippyOrderId);
        }

        List<NormalizedShippingOption> options = quotes.stream()
                .map(q -> new NormalizedShippingOption(
                        q.getCarrierCode(),
                        q.getCarrierCode().equalsIgnoreCase("FASTSHIP") ? "FastShip" :
                        q.getCarrierCode().equalsIgnoreCase("QUICKEXPRESS") ? "QuickExpress" : "ReliableCourier",
                        q.getServiceCode(),
                        q.getServiceName(),
                        q.getBaseCharge(),
                        q.getCodCharge(),
                        q.getAdditionalCharges(),
                        q.getTax(),
                        q.getTotalCharge(),
                        q.getEstimatedMinDays(),
                        q.getEstimatedMaxDays()
                ))
                .collect(Collectors.toList());

        sortOptions(options, sortBy);

        return new RateResponse(zippyOrderId, options, Collections.emptyList());
    }

    public void sortOptions(List<NormalizedShippingOption> options, String sortBy) {
        if (sortBy == null || options == null) return;

        switch (sortBy.toLowerCase()) {
            case "price":
            case "lowest_price":
                options.sort(Comparator.comparing(NormalizedShippingOption::getTotalCharge));
                break;
            case "speed":
            case "fastest":
                options.sort(Comparator.comparing(NormalizedShippingOption::getEstimatedMinDays)
                        .thenComparing(NormalizedShippingOption::getEstimatedMaxDays)
                        .thenComparing(NormalizedShippingOption::getTotalCharge));
                break;
            case "carrier":
            case "carrier_name":
                options.sort(Comparator.comparing(NormalizedShippingOption::getCarrierName)
                        .thenComparing(NormalizedShippingOption::getTotalCharge));
                break;
            default:
                break;
        }
    }
}
