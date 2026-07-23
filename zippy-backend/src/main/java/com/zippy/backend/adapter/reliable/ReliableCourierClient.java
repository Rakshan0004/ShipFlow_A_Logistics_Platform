package com.zippy.backend.adapter.reliable;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.zippy.backend.adapter.CourierClient;
import com.zippy.backend.dto.NormalizedShippingOption;
import com.zippy.backend.exception.CourierUnavailableException;
import com.zippy.backend.model.Order;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.util.UriComponentsBuilder;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
public class ReliableCourierClient implements CourierClient {

    private static final Logger log = LoggerFactory.getLogger(ReliableCourierClient.class);
    private static final Pattern ETA_RANGE_PATTERN = Pattern.compile("(\\d+)-(\\d+)");
    private static final Pattern ETA_SINGLE_PATTERN = Pattern.compile("(\\d+)");

    private final WebClient webClient;
    private final ObjectMapper objectMapper;
    private final String baseUrl;

    public ReliableCourierClient(WebClient webClient,
                                 ObjectMapper objectMapper,
                                 @Value("${couriers.reliable.base-url:http://localhost:8081}") String baseUrl) {
        this.webClient = webClient;
        this.objectMapper = objectMapper;
        this.baseUrl = baseUrl;
    }

    @Override
    public String getCarrierCode() {
        return "RELIABLE";
    }

    @Override
    public String getCarrierName() {
        return "ReliableCourier";
    }

    @Override
    public List<NormalizedShippingOption> getRates(Order order) {
        boolean isCod = "COD".equalsIgnoreCase(order.getPaymentType());
        BigDecimal amount = order.getCodAmount() != null ? order.getCodAmount() : BigDecimal.ZERO;

        String uri = UriComponentsBuilder.fromHttpUrl(baseUrl + "/reliablecourier/shipping-options")
                .queryParam("from", order.getPickupPincode())
                .queryParam("to", order.getDeliveryPincode())
                .queryParam("weight", order.getWeightGrams())
                .queryParam("cod", isCod)
                .queryParam("amount", amount)
                .toUriString();

        try {
            ReliableCourierRateResponse response = webClient.get()
                    .uri(uri)
                    .retrieve()
                    .bodyToMono(ReliableCourierRateResponse.class)
                    .block();

            if (response == null || response.getCode() == null || response.getCode() != 200 || response.getData() == null) {
                log.warn("ReliableCourier returned unsuccessful code or null data");
                throw new CourierUnavailableException(getCarrierCode(), "Response code not 200");
            }

            List<NormalizedShippingOption> options = new ArrayList<>();
            String rawJson = objectMapper.writeValueAsString(response);

            for (ReliableCourierRateResponse.OptionData data : response.getData()) {
                ReliableCourierRateResponse.RateDetail rate = data.getRate();
                int[] minMaxDays = parseEta(data.getEta());

                NormalizedShippingOption option = new NormalizedShippingOption(
                        getCarrierCode(),
                        getCarrierName(),
                        data.getId(),
                        data.getName(),
                        rate != null ? rate.getBase() : BigDecimal.ZERO,
                        rate != null ? rate.getCashCollectionFee() : BigDecimal.ZERO,
                        rate != null ? rate.getHandling() : BigDecimal.ZERO,
                        rate != null ? rate.getTaxAmount() : BigDecimal.ZERO,
                        rate != null ? rate.getGrandTotal() : BigDecimal.ZERO,
                        minMaxDays[0],
                        minMaxDays[1]
                );
                option.setRawCarrierResponse(rawJson);
                options.add(option);
            }

            return options;
        } catch (CourierUnavailableException e) {
            throw e;
        } catch (Exception e) {
            log.warn("ReliableCourier rate fetch failed: {}", e.getMessage());
            throw new CourierUnavailableException(getCarrierCode(), e);
        }
    }

    private int[] parseEta(String etaStr) {
        if (etaStr == null) {
            return new int[]{3, 5};
        }
        Matcher rangeMatcher = ETA_RANGE_PATTERN.matcher(etaStr);
        if (rangeMatcher.find()) {
            int min = Integer.parseInt(rangeMatcher.group(1));
            int max = Integer.parseInt(rangeMatcher.group(2));
            return new int[]{min, max};
        }
        Matcher singleMatcher = ETA_SINGLE_PATTERN.matcher(etaStr);
        if (singleMatcher.find()) {
            int val = Integer.parseInt(singleMatcher.group(1));
            return new int[]{val, val};
        }
        return new int[]{3, 5};
    }

    public static class ReliableCourierRateResponse {
        private Integer code;
        private List<OptionData> data;

        public ReliableCourierRateResponse() {}

        public Integer getCode() { return code; }
        public void setCode(Integer code) { this.code = code; }
        public List<OptionData> getData() { return data; }
        public void setData(List<OptionData> data) { this.data = data; }

        public static class OptionData {
            private String id;
            private String name;
            private RateDetail rate;
            private String eta;

            public OptionData() {}

            public String getId() { return id; }
            public String getName() { return name; }
            public RateDetail getRate() { return rate; }
            public String getEta() { return eta; }
        }

        public static class RateDetail {
            private BigDecimal base;
            private BigDecimal handling;
            private BigDecimal cashCollectionFee;
            private BigDecimal taxAmount;
            private BigDecimal grandTotal;

            public RateDetail() {}

            public BigDecimal getBase() { return base; }
            public BigDecimal getHandling() { return handling; }
            public BigDecimal getCashCollectionFee() { return cashCollectionFee; }
            public BigDecimal getTaxAmount() { return taxAmount; }
            public BigDecimal getGrandTotal() { return grandTotal; }
        }
    }
}
