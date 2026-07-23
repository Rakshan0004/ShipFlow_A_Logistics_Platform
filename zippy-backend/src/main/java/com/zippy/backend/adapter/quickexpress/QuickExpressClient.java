package com.zippy.backend.adapter.quickexpress;

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
public class QuickExpressClient implements CourierClient {

    private static final Logger log = LoggerFactory.getLogger(QuickExpressClient.class);

    private final WebClient webClient;
    private final ObjectMapper objectMapper;
    private final String baseUrl;

    public QuickExpressClient(WebClient webClient,
                               ObjectMapper objectMapper,
                               @Value("${couriers.quickexpress.base-url:http://localhost:8081}") String baseUrl) {
        this.webClient = webClient;
        this.objectMapper = objectMapper;
        this.baseUrl = baseUrl;
    }

    @Override
    public String getCarrierCode() {
        return "QUICKEXPRESS";
    }

    @Override
    public String getCarrierName() {
        return "QuickExpress";
    }

    @Override
    public ShipmentCreationResult createShipment(Order order, ShippingQuote selectedQuote) {
        String url = baseUrl + "/quickexpress/booking/create";
        String quoteId = extractQuoteId(selectedQuote.getRawCarrierResponse());

        QuickExpressShipmentRequest request = new QuickExpressShipmentRequest();
        request.setClientOrderId(order.getZippyOrderId());
        request.setQuoteId(quoteId != null ? quoteId : "QE-Q-90001");
        request.setProductType(selectedQuote.getServiceCode());

        QuickExpressShipmentRequest.ReceiverDetails receiver = new QuickExpressShipmentRequest.ReceiverDetails();
        receiver.setFullName(order.getCustomerName());
        receiver.setMobileNumber(order.getCustomerPhone());
        receiver.setPostalCode(order.getDeliveryPincode());
        request.setReceiverDetails(receiver);

        QuickExpressShipmentRequest.PackageDetails packageDetails = new QuickExpressShipmentRequest.PackageDetails();
        packageDetails.setDeadWeight(order.getWeightGrams());
        packageDetails.setWeightUnit("GRAM");
        request.setPackageDetails(packageDetails);

        QuickExpressShipmentRequest.Payment payment = new QuickExpressShipmentRequest.Payment();
        boolean isCod = "COD".equalsIgnoreCase(order.getPaymentType());
        payment.setMode(isCod ? "CASH_ON_DELIVERY" : "PREPAID");
        payment.setAmountToCollect(order.getCodAmount() != null ? order.getCodAmount() : BigDecimal.ZERO);
        request.setPayment(payment);

        request.setWebhook("http://zippy-backend/api/webhooks/quickexpress");

        try {
            QuickExpressShipmentResponse response = webClient.post()
                    .uri(url)
                    .bodyValue(request)
                    .retrieve()
                    .bodyToMono(QuickExpressShipmentResponse.class)
                    .block();

            if (response == null || !"CONFIRMED".equalsIgnoreCase(response.getBookingStatus()) || response.getBooking() == null) {
                throw new CourierUnavailableException(getCarrierCode(), "Booking creation returned unconfirmed status");
            }

            QuickExpressShipmentResponse.Booking booking = response.getBooking();
            return new ShipmentCreationResult(
                    getCarrierCode(),
                    booking.getBookingId(),
                    booking.getAwb(),
                    null,
                    booking.getCurrentState() != null ? booking.getCurrentState() : "SHIPMENT_CREATED"
            );
        } catch (Exception e) {
            log.warn("QuickExpress shipment creation failed: {}", e.getMessage());
            throw new CourierUnavailableException(getCarrierCode(), e);
        }
    }

    private String extractQuoteId(String rawResponse) {
        if (rawResponse == null) return "QE-Q-90001";
        try {
            QuickExpressRateResponse response = objectMapper.readValue(rawResponse, QuickExpressRateResponse.class);
            return response.getQuoteId();
        } catch (Exception e) {
            return "QE-Q-90001";
        }
    }

    @Override
    public List<NormalizedShippingOption> getRates(Order order) {
        String url = baseUrl + "/quickexpress/rates/check";
        boolean isCod = "COD".equalsIgnoreCase(order.getPaymentType());

        QuickExpressRateRequest request = new QuickExpressRateRequest(
                order.getPickupPincode(),
                order.getDeliveryPincode(),
                order.getWeightGrams(),
                new QuickExpressRateRequest.Dimensions(
                        order.getLengthCm() != null ? order.getLengthCm() : 0,
                        order.getWidthCm() != null ? order.getWidthCm() : 0,
                        order.getHeightCm() != null ? order.getHeightCm() : 0
                ),
                isCod,
                order.getCodAmount() != null ? order.getCodAmount() : BigDecimal.ZERO
        );

        try {
            QuickExpressRateResponse response = webClient.post()
                    .uri(url)
                    .bodyValue(request)
                    .retrieve()
                    .bodyToMono(QuickExpressRateResponse.class)
                    .block();

            if (response == null || !"AVAILABLE".equalsIgnoreCase(response.getStatus())) {
                log.warn("QuickExpress status is unavailable or null");
                throw new CourierUnavailableException(getCarrierCode(), "Rate unavailable");
            }

            QuickExpressRateResponse.Charges charges = response.getCharges();
            QuickExpressRateResponse.DeliveryEstimate estimate = response.getDeliveryEstimate();

            String serviceCode = response.getProduct();
            String serviceName = "QuickExpress " + (serviceCode != null ? serviceCode.substring(0, 1).toUpperCase() + serviceCode.substring(1).toLowerCase() : "Express");

            NormalizedShippingOption option = new NormalizedShippingOption(
                    getCarrierCode(),
                    getCarrierName(),
                    serviceCode,
                    serviceName,
                    charges != null ? charges.getShipping() : BigDecimal.ZERO,
                    charges != null ? charges.getCod() : BigDecimal.ZERO,
                    charges != null ? charges.getFuelSurcharge() : BigDecimal.ZERO,
                    charges != null ? charges.getGst() : BigDecimal.ZERO,
                    response.getPayable(),
                    estimate != null ? estimate.getMinimumDays() : 1,
                    estimate != null ? estimate.getMaximumDays() : 3
            );
            option.setRawCarrierResponse(objectMapper.writeValueAsString(response));

            return List.of(option);
        } catch (CourierUnavailableException e) {
            throw e;
        } catch (Exception e) {
            log.warn("QuickExpress rate fetch failed: {}", e.getMessage());
            throw new CourierUnavailableException(getCarrierCode(), e);
        }
    }

    public static class QuickExpressRateRequest {
        private String pickupPincode;
        private String deliveryPincode;
        private Integer weightInGrams;
        private Dimensions dimensions;
        private Boolean isCod;
        private BigDecimal collectableAmount;

        public QuickExpressRateRequest() {}

        public QuickExpressRateRequest(String pickupPincode, String deliveryPincode, Integer weightInGrams, Dimensions dimensions, Boolean isCod, BigDecimal collectableAmount) {
            this.pickupPincode = pickupPincode;
            this.deliveryPincode = deliveryPincode;
            this.weightInGrams = weightInGrams;
            this.dimensions = dimensions;
            this.isCod = isCod;
            this.collectableAmount = collectableAmount;
        }

        public String getPickupPincode() { return pickupPincode; }
        public String getDeliveryPincode() { return deliveryPincode; }
        public Integer getWeightInGrams() { return weightInGrams; }
        public Dimensions getDimensions() { return dimensions; }
        public Boolean getIsCod() { return isCod; }
        public BigDecimal getCollectableAmount() { return collectableAmount; }

        public static class Dimensions {
            private Integer length;
            private Integer breadth;
            private Integer height;

            public Dimensions() {}

            public Dimensions(Integer length, Integer breadth, Integer height) {
                this.length = length;
                this.breadth = breadth;
                this.height = height;
            }

            public Integer getLength() { return length; }
            public Integer getBreadth() { return breadth; }
            public Integer getHeight() { return height; }
        }
    }

    public static class QuickExpressRateResponse {
        private String status;
        private String quoteId;
        private Charges charges;
        private BigDecimal payable;
        private DeliveryEstimate deliveryEstimate;
        private String product;

        public QuickExpressRateResponse() {}

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public String getQuoteId() { return quoteId; }
        public void setQuoteId(String quoteId) { this.quoteId = quoteId; }
        public Charges getCharges() { return charges; }
        public void setCharges(Charges charges) { this.charges = charges; }
        public BigDecimal getPayable() { return payable; }
        public void setPayable(BigDecimal payable) { this.payable = payable; }
        public DeliveryEstimate getDeliveryEstimate() { return deliveryEstimate; }
        public void setDeliveryEstimate(DeliveryEstimate deliveryEstimate) { this.deliveryEstimate = deliveryEstimate; }
        public String getProduct() { return product; }
        public void setProduct(String product) { this.product = product; }

        public static class Charges {
            private BigDecimal shipping;
            private BigDecimal cod;
            private BigDecimal fuelSurcharge;
            private BigDecimal gst;

            public Charges() {}

            public BigDecimal getShipping() { return shipping; }
            public BigDecimal getCod() { return cod; }
            public BigDecimal getFuelSurcharge() { return fuelSurcharge; }
            public BigDecimal getGst() { return gst; }
        }

        public static class DeliveryEstimate {
            private Integer minimumDays;
            private Integer maximumDays;

            public DeliveryEstimate() {}

            public Integer getMinimumDays() { return minimumDays; }
            public Integer getMaximumDays() { return maximumDays; }
        }
    }

    public static class QuickExpressShipmentRequest {
        private String clientOrderId;
        private String quoteId;
        private String productType;
        private ReceiverDetails receiverDetails;
        private PackageDetails packageDetails;
        private Payment payment;
        private String webhook;

        public QuickExpressShipmentRequest() {}

        public String getClientOrderId() { return clientOrderId; }
        public void setClientOrderId(String clientOrderId) { this.clientOrderId = clientOrderId; }
        public String getQuoteId() { return quoteId; }
        public void setQuoteId(String quoteId) { this.quoteId = quoteId; }
        public String getProductType() { return productType; }
        public void setProductType(String productType) { this.productType = productType; }
        public ReceiverDetails getReceiverDetails() { return receiverDetails; }
        public void setReceiverDetails(ReceiverDetails receiverDetails) { this.receiverDetails = receiverDetails; }
        public PackageDetails getPackageDetails() { return packageDetails; }
        public void setPackageDetails(PackageDetails packageDetails) { this.packageDetails = packageDetails; }
        public Payment getPayment() { return payment; }
        public void setPayment(Payment payment) { this.payment = payment; }
        public String getWebhook() { return webhook; }
        public void setWebhook(String webhook) { this.webhook = webhook; }

        public static class ReceiverDetails {
            private String fullName;
            private String mobileNumber;
            private String postalCode;
            public ReceiverDetails() {}
            public String getFullName() { return fullName; }
            public void setFullName(String fullName) { this.fullName = fullName; }
            public String getMobileNumber() { return mobileNumber; }
            public void setMobileNumber(String mobileNumber) { this.mobileNumber = mobileNumber; }
            public String getPostalCode() { return postalCode; }
            public void setPostalCode(String postalCode) { this.postalCode = postalCode; }
        }

        public static class PackageDetails {
            private Integer deadWeight;
            private String weightUnit;
            public PackageDetails() {}
            public Integer getDeadWeight() { return deadWeight; }
            public void setDeadWeight(Integer deadWeight) { this.deadWeight = deadWeight; }
            public String getWeightUnit() { return weightUnit; }
            public void setWeightUnit(String weightUnit) { this.weightUnit = weightUnit; }
        }

        public static class Payment {
            private String mode;
            private BigDecimal amountToCollect;
            public Payment() {}
            public String getMode() { return mode; }
            public void setMode(String mode) { this.mode = mode; }
            public BigDecimal getAmountToCollect() { return amountToCollect; }
            public void setAmountToCollect(BigDecimal amountToCollect) { this.amountToCollect = amountToCollect; }
        }
    }

    public static class QuickExpressShipmentResponse {
        private String bookingStatus;
        private Booking booking;

        public QuickExpressShipmentResponse() {}

        public String getBookingStatus() { return bookingStatus; }
        public void setBookingStatus(String bookingStatus) { this.bookingStatus = bookingStatus; }
        public Booking getBooking() { return booking; }
        public void setBooking(Booking booking) { this.booking = booking; }

        public static class Booking {
            private String bookingId;
            private String awb;
            private String currentState;

            public Booking() {}

            public String getBookingId() { return bookingId; }
            public void setBookingId(String bookingId) { this.bookingId = bookingId; }
            public String getAwb() { return awb; }
            public void setAwb(String awb) { this.awb = awb; }
            public String getCurrentState() { return currentState; }
            public void setCurrentState(String currentState) { this.currentState = currentState; }
        }
    }
}

