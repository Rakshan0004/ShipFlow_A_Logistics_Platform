package com.zippy.backend.dto;

import java.util.List;

public class RecentOrdersResponse {

    private List<RecentOrderDto> orders;

    public RecentOrdersResponse() {
    }

    public RecentOrdersResponse(List<RecentOrderDto> orders) {
        this.orders = orders;
    }

    public List<RecentOrderDto> getOrders() {
        return orders;
    }

    public void setOrders(List<RecentOrderDto> orders) {
        this.orders = orders;
    }
}
