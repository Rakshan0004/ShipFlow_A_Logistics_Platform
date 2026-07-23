package com.zippy.backend.adapter.fastship;

import com.fasterxml.jackson.annotation.JsonProperty;
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

import java.math.BigDecimal;
import java.util.List;

@Component
public class FastShipClient implements CourierClient {

    private static final Logger log = LoggerFactory.getLogger(FastShipClient.class);

    private final WebClient webClient;
    private final ObjectMapper objectMapper;
    private final String baseUrl;

    public FastShipClient(WebClient webClient,
                          ObjectMapper objectMapper,
                          @Value("${couriers.fastship.base-url:http://localhost:8081}") String baseUrl) {
        this.webClient = webClient;
        this.objectMapper = objectMapper;
        this.baseUrl = baseUrl;
    }

    @Override
    public String getCarrierCode() {
        return "FASTSHIP";
    }

    @Override
    public String getCarrierName() {
        return "FastShip";
    }

    @Override
    public List<NormalizedShippingOption> getRates(Order order) {
        String url = baseUrl + "/fastship/api/v1/rate";
        FastShipRateRequest request = new FastShipRateRequest(
                order.getPickupPincode(),
                order.getDeliveryPincode(),
                order.getWeightGrams() != null ? order.getWeightGrams() / 1000.0 : 0.0,
                order.getPaymentType(),
                order.getCodAmount() != null ? order.getCodAmount() : BigDecimal.ZERO
        );

        try {
            FastShipRateResponse response = webClient.post()
                    .uri(url)
                    .bodyValue(request)
                    .retrieve()
                    .bodyToMono(FastShipRateResponse.class)
                    .block();

            if (response == null || !Boolean.TRUE.equals(response.getSuccess()) || response.getService() == null) {
                log.warn("FastShip returned unsuccessful or empty response");
                throw new CourierUnavailableException(getCarrierCode(), "Unsuccessful rate response");
            }

            FastShipRateResponse.ServiceDetail service = response.getService();
            NormalizedShippingOption option = new NormalizedShippingOption(
                    getCarrierCode(),
                    getCarrierName(),
                    service.getServiceCode(),
                    service.getServiceName(),
                    service.getFreightCharge(),
                    service.getCodCharge(),
                    BigDecimal.ZERO,
                    service.getTax(),
                    service.getTotalAmount(),
                    service.getEstimatedDays(),
                    service.getEstimatedDays()
            );
            option.setRawCarrierResponse(objectMapper.writeValueAsString(response));

            return List.of(option);
        } catch (CourierUnavailableException e) {
            throw e;
        } catch (Exception e) {
            log.warn("FastShip rate fetch failed: {}", e.getMessage());
            throw new CourierUnavailableException(getCarrierCode(), e);
        }
    }

    public static class FastShipRateRequest {
        @JsonProperty("origin_pin")
        private String originPin;
        @JsonProperty("destination_pin")
        private String destinationPin;
        @JsonProperty("weight_kg")
        private Double weightKg;
        @JsonProperty("payment_mode")
        private String paymentMode;
        @JsonProperty("invoice_value")
        private BigDecimal invoiceValue;

        public FastShipRateRequest() {}

        public FastShipRateRequest(String originPin, String destinationPin, Double weightKg, String paymentMode, BigDecimal invoiceValue) {
            this.originPin = originPin;
            this.destinationPin = destinationPin;
            this.weightKg = weightKg;
            this.paymentMode = paymentMode;
            this.invoiceValue = invoiceValue;
        }

        public String getOriginPin() { return originPin; }
        public String getDestinationPin() { return destinationPin; }
        public Double getWeightKg() { return weightKg; }
        public String getPaymentMode() { return paymentMode; }
        public BigDecimal getInvoiceValue() { return invoiceValue; }
    }

    public static class FastShipRateResponse {
        private Boolean success;
        private ServiceDetail service;

        public FastShipRateResponse() {}

        public Boolean getSuccess() { return success; }
        public void setSuccess(Boolean success) { this.success = success; }
        public ServiceDetail getService() { return service; }
        public void setService(ServiceDetail service) { this.service = service; }

        public static class ServiceDetail {
            @JsonProperty("service_code")
            private String serviceCode;
            @JsonProperty("service_name")
            private String serviceName;
            @JsonProperty("freight_charge")
            private BigDecimal freightCharge;
            @JsonProperty("cod_charge")
            private BigDecimal codCharge;
            private BigDecimal tax;
            @JsonProperty("total_amount")
            private BigDecimal totalAmount;
            @JsonProperty("estimated_days")
            private Integer estimatedDays;

            public ServiceDetail() {}

            public String getServiceCode() { return serviceCode; }
            public String getServiceName() { return serviceName; }
            public BigDecimal getFreightCharge() { return freightCharge; }
            public BigDecimal getCodCharge() { return codCharge; }
            public BigDecimal getTax() { return tax; }
            public BigDecimal getTotalAmount() { return totalAmount; }
            public Integer getEstimatedDays() { return estimatedDays; }
        }
    }
}
