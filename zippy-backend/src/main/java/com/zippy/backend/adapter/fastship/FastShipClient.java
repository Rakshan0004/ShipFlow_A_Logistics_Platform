package com.zippy.backend.adapter.fastship;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.zippy.backend.adapter.CourierClient;
import com.zippy.backend.dto.NormalizedShippingOption;
import com.zippy.backend.dto.ShipmentCreationResult;
import com.zippy.backend.exception.CourierUnavailableException;
import com.zippy.backend.model.Order;
import com.zippy.backend.model.ShippingQuote;
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
    public ShipmentCreationResult createShipment(Order order, ShippingQuote selectedQuote) {
        String url = baseUrl + "/fastship/api/v1/shipments";
        FastShipShipmentRequest request = new FastShipShipmentRequest();
        request.setReferenceNumber(order.getZippyOrderId());
        request.setServiceCode(selectedQuote.getServiceCode());

        FastShipShipmentRequest.Shipper shipper = new FastShipShipmentRequest.Shipper();
        shipper.setName("Zippy Merchant");
        shipper.setPostalCode(order.getPickupPincode());
        request.setShipper(shipper);

        FastShipShipmentRequest.Consignee consignee = new FastShipShipmentRequest.Consignee();
        consignee.setName(order.getCustomerName());
        consignee.setPhone(order.getCustomerPhone());
        consignee.setPostalCode(order.getDeliveryPincode());
        request.setConsignee(consignee);

        FastShipShipmentRequest.Parcel parcel = new FastShipShipmentRequest.Parcel();
        parcel.setWeightKg(order.getWeightGrams() != null ? order.getWeightGrams() / 1000.0 : 0.0);
        request.setParcel(parcel);

        FastShipShipmentRequest.CodDetail cod = new FastShipShipmentRequest.CodDetail();
        boolean isCod = "COD".equalsIgnoreCase(order.getPaymentType());
        cod.setEnabled(isCod);
        cod.setAmount(order.getCodAmount() != null ? order.getCodAmount() : BigDecimal.ZERO);
        request.setCod(cod);

        request.setCallbackUrl("http://zippy-backend/api/webhooks/fastship");

        try {
            FastShipShipmentResponse response = webClient.post()
                    .uri(url)
                    .bodyValue(request)
                    .retrieve()
                    .bodyToMono(FastShipShipmentResponse.class)
                    .block();

            if (response == null || !Boolean.TRUE.equals(response.getSuccess())) {
                throw new CourierUnavailableException(getCarrierCode(), "Shipment creation returned unsuccessful status");
            }

            return new ShipmentCreationResult(
                    getCarrierCode(),
                    response.getShipmentId(),
                    response.getTrackingNumber(),
                    response.getLabelUrl(),
                    response.getStatus() != null ? response.getStatus() : "BOOKED"
            );
        } catch (Exception e) {
            log.warn("FastShip shipment creation failed: {}", e.getMessage());
            throw new CourierUnavailableException(getCarrierCode(), e);
        }
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

    public static class FastShipShipmentRequest {
        @JsonProperty("reference_number")
        private String referenceNumber;
        @JsonProperty("service_code")
        private String serviceCode;
        private Shipper shipper;
        private Consignee consignee;
        private Parcel parcel;
        private CodDetail cod;
        @JsonProperty("callback_url")
        private String callbackUrl;

        public FastShipShipmentRequest() {}

        public String getReferenceNumber() { return referenceNumber; }
        public void setReferenceNumber(String referenceNumber) { this.referenceNumber = referenceNumber; }
        public String getServiceCode() { return serviceCode; }
        public void setServiceCode(String serviceCode) { this.serviceCode = serviceCode; }
        public Shipper getShipper() { return shipper; }
        public void setShipper(Shipper shipper) { this.shipper = shipper; }
        public Consignee getConsignee() { return consignee; }
        public void setConsignee(Consignee consignee) { this.consignee = consignee; }
        public Parcel getParcel() { return parcel; }
        public void setParcel(Parcel parcel) { this.parcel = parcel; }
        public CodDetail getCod() { return cod; }
        public void setCod(CodDetail cod) { this.cod = cod; }
        public String getCallbackUrl() { return callbackUrl; }
        public void setCallbackUrl(String callbackUrl) { this.callbackUrl = callbackUrl; }

        public static class Shipper {
            private String name;
            @JsonProperty("postal_code")
            private String postalCode;
            public Shipper() {}
            public String getName() { return name; }
            public void setName(String name) { this.name = name; }
            public String getPostalCode() { return postalCode; }
            public void setPostalCode(String postalCode) { this.postalCode = postalCode; }
        }

        public static class Consignee {
            private String name;
            private String phone;
            @JsonProperty("postal_code")
            private String postalCode;
            public Consignee() {}
            public String getName() { return name; }
            public void setName(String name) { this.name = name; }
            public String getPhone() { return phone; }
            public void setPhone(String phone) { this.phone = phone; }
            public String getPostalCode() { return postalCode; }
            public void setPostalCode(String postalCode) { this.postalCode = postalCode; }
        }

        public static class Parcel {
            @JsonProperty("weight_kg")
            private Double weightKg;
            public Parcel() {}
            public Double getWeightKg() { return weightKg; }
            public void setWeightKg(Double weightKg) { this.weightKg = weightKg; }
        }

        public static class CodDetail {
            private Boolean enabled;
            private BigDecimal amount;
            public CodDetail() {}
            public Boolean getEnabled() { return enabled; }
            public void setEnabled(Boolean enabled) { this.enabled = enabled; }
            public BigDecimal getAmount() { return amount; }
            public void setAmount(BigDecimal amount) { this.amount = amount; }
        }
    }

    public static class FastShipShipmentResponse {
        private Boolean success;
        @JsonProperty("shipment_id")
        private String shipmentId;
        @JsonProperty("tracking_number")
        private String trackingNumber;
        @JsonProperty("label_url")
        private String labelUrl;
        private String status;

        public FastShipShipmentResponse() {}

        public Boolean getSuccess() { return success; }
        public void setSuccess(Boolean success) { this.success = success; }
        public String getShipmentId() { return shipmentId; }
        public void setShipmentId(String shipmentId) { this.shipmentId = shipmentId; }
        public String getTrackingNumber() { return trackingNumber; }
        public void setTrackingNumber(String trackingNumber) { this.trackingNumber = trackingNumber; }
        public String getLabelUrl() { return labelUrl; }
        public void setLabelUrl(String labelUrl) { this.labelUrl = labelUrl; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
    }
}

