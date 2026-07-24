package com.zippy.backend.dto;

import java.math.BigDecimal;
import java.util.Map;

public class DashboardStatsResponse {

    private Long totalOrders;
    private Long activeShipments;
    private Long deliveredToday;
    private BigDecimal totalRevenue;
    private Map<String, Long> courierBreakdown;
    private Map<String, Long> statusBreakdown;

    public DashboardStatsResponse() {
    }

    public DashboardStatsResponse(Long totalOrders, Long activeShipments, Long deliveredToday,
                                  BigDecimal totalRevenue, Map<String, Long> courierBreakdown,
                                  Map<String, Long> statusBreakdown) {
        this.totalOrders = totalOrders;
        this.activeShipments = activeShipments;
        this.deliveredToday = deliveredToday;
        this.totalRevenue = totalRevenue;
        this.courierBreakdown = courierBreakdown;
        this.statusBreakdown = statusBreakdown;
    }

    public Long getTotalOrders() {
        return totalOrders;
    }

    public void setTotalOrders(Long totalOrders) {
        this.totalOrders = totalOrders;
    }

    public Long getActiveShipments() {
        return activeShipments;
    }

    public void setActiveShipments(Long activeShipments) {
        this.activeShipments = activeShipments;
    }

    public Long getDeliveredToday() {
        return deliveredToday;
    }

    public void setDeliveredToday(Long deliveredToday) {
        this.deliveredToday = deliveredToday;
    }

    public BigDecimal getTotalRevenue() {
        return totalRevenue;
    }

    public void setTotalRevenue(BigDecimal totalRevenue) {
        this.totalRevenue = totalRevenue;
    }

    public Map<String, Long> getCourierBreakdown() {
        return courierBreakdown;
    }

    public void setCourierBreakdown(Map<String, Long> courierBreakdown) {
        this.courierBreakdown = courierBreakdown;
    }

    public Map<String, Long> getStatusBreakdown() {
        return statusBreakdown;
    }

    public void setStatusBreakdown(Map<String, Long> statusBreakdown) {
        this.statusBreakdown = statusBreakdown;
    }
}
