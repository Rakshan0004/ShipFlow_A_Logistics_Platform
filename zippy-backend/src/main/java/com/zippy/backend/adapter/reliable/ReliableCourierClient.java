package com.zippy.backend.adapter.reliable;

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
    public ShipmentCreationResult createShipment(Order order, ShippingQuote selectedQuote) {
        String url = baseUrl + "/reliablecourier/orders";
        ReliableCourierShipmentRequest request = new ReliableCourierShipmentRequest();
        request.setOrderReference(order.getZippyOrderId());
        request.setSelectedOption(selectedQuote.getServiceCode());

        ReliableCourierShipmentRequest.Destination destination = new ReliableCourierShipmentRequest.Destination();
        destination.setContact(order.getCustomerName());
        destination.setPhone(order.getCustomerPhone());
        destination.setZip(order.getDeliveryPincode());
        request.setDestination(destination);

        ReliableCourierShipmentRequest.ParcelWeight parcelWeight = new ReliableCourierShipmentRequest.ParcelWeight();
        parcelWeight.setValue(order.getWeightGrams() != null ? order.getWeightGrams() / 1000.0 : 0.0);
        parcelWeight.setUnit("KG");
        request.setParcelWeight(parcelWeight);

        boolean isCod = "COD".equalsIgnoreCase(order.getPaymentType());
        request.setCollectionType(isCod ? "COD" : "PREPAID");
        request.setCollectionAmount(order.getCodAmount() != null ? order.getCodAmount() : BigDecimal.ZERO);
        request.setStatusNotificationUrl("http://zippy-backend:8080/api/webhooks/reliable");

        try {
            ReliableCourierShipmentResponse response = webClient.put()
                    .uri(url)
                    .bodyValue(request)
                    .retrieve()
                    .bodyToMono(ReliableCourierShipmentResponse.class)
                    .block();

            if (response == null || !"ACCEPTED".equalsIgnoreCase(response.getResult()) || response.getDeliveryOrder() == null) {
                throw new CourierUnavailableException(getCarrierCode(), "ReliableCourier order creation failed or returned non-accepted status");
            }

            ReliableCourierShipmentResponse.DeliveryOrder doObj = response.getDeliveryOrder();
            return new ShipmentCreationResult(
                    getCarrierCode(),
                    doObj.getId(),
                    doObj.getTrackingCode(),
                    null,
                    "SHIPMENT_CREATED"
            );
        } catch (Exception e) {
            log.warn("ReliableCourier shipment creation failed: {}", e.getMessage());
            throw new CourierUnavailableException(getCarrierCode(), e);
        }
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

    public static class ReliableCourierShipmentRequest {
        private String orderReference;
        private String selectedOption;
        private Destination destination;
        private ParcelWeight parcelWeight;
        private String collectionType;
        private BigDecimal collectionAmount;
        private String statusNotificationUrl;

        public ReliableCourierShipmentRequest() {}

        public String getOrderReference() { return orderReference; }
        public void setOrderReference(String orderReference) { this.orderReference = orderReference; }
        public String getSelectedOption() { return selectedOption; }
        public void setSelectedOption(String selectedOption) { this.selectedOption = selectedOption; }
        public Destination getDestination() { return destination; }
        public void setDestination(Destination destination) { this.destination = destination; }
        public ParcelWeight getParcelWeight() { return parcelWeight; }
        public void setParcelWeight(ParcelWeight parcelWeight) { this.parcelWeight = parcelWeight; }
        public String getCollectionType() { return collectionType; }
        public void setCollectionType(String collectionType) { this.collectionType = collectionType; }
        public BigDecimal getCollectionAmount() { return collectionAmount; }
        public void setCollectionAmount(BigDecimal collectionAmount) { this.collectionAmount = collectionAmount; }
        public String getStatusNotificationUrl() { return statusNotificationUrl; }
        public void setStatusNotificationUrl(String statusNotificationUrl) { this.statusNotificationUrl = statusNotificationUrl; }

        public static class Destination {
            private String contact;
            private String phone;
            private String zip;
            public Destination() {}
            public String getContact() { return contact; }
            public void setContact(String contact) { this.contact = contact; }
            public String getPhone() { return phone; }
            public void setPhone(String phone) { this.phone = phone; }
            public String getZip() { return zip; }
            public void setZip(String zip) { this.zip = zip; }
        }

        public static class ParcelWeight {
            private Double value;
            private String unit;
            public ParcelWeight() {}
            public Double getValue() { return value; }
            public void setValue(Double value) { this.value = value; }
            public String getUnit() { return unit; }
            public void setUnit(String unit) { this.unit = unit; }
        }
    }

    public static class ReliableCourierShipmentResponse {
        private String result;
        private DeliveryOrder deliveryOrder;
        private String message;

        public ReliableCourierShipmentResponse() {}

        public String getResult() { return result; }
        public void setResult(String result) { this.result = result; }
        public DeliveryOrder getDeliveryOrder() { return deliveryOrder; }
        public void setDeliveryOrder(DeliveryOrder deliveryOrder) { this.deliveryOrder = deliveryOrder; }
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }

        public static class DeliveryOrder {
            private String id;
            private String trackingCode;
            public DeliveryOrder() {}
            public String getId() { return id; }
            public void setId(String id) { this.id = id; }
            public String getTrackingCode() { return trackingCode; }
            public void setTrackingCode(String trackingCode) { this.trackingCode = trackingCode; }
        }
    }
}

