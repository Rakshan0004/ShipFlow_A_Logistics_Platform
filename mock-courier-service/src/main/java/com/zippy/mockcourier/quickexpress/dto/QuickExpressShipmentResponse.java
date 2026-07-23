package com.zippy.mockcourier.quickexpress.dto;

public class QuickExpressShipmentResponse {

    private String bookingStatus;
    private Booking booking;

    public QuickExpressShipmentResponse() {
    }

    public QuickExpressShipmentResponse(String bookingStatus, Booking booking) {
        this.bookingStatus = bookingStatus;
        this.booking = booking;
    }

    public String getBookingStatus() {
        return bookingStatus;
    }

    public void setBookingStatus(String bookingStatus) {
        this.bookingStatus = bookingStatus;
    }

    public Booking getBooking() {
        return booking;
    }

    public void setBooking(Booking booking) {
        this.booking = booking;
    }

    public static class Booking {
        private String bookingId;
        private String awb;
        private String currentState;

        public Booking() {}

        public Booking(String bookingId, String awb, String currentState) {
            this.bookingId = bookingId;
            this.awb = awb;
            this.currentState = currentState;
        }

        public String getBookingId() { return bookingId; }
        public void setBookingId(String bookingId) { this.bookingId = bookingId; }
        public String getAwb() { return awb; }
        public void setAwb(String awb) { this.awb = awb; }
        public String getCurrentState() { return currentState; }
        public void setCurrentState(String currentState) { this.currentState = currentState; }
    }
}
