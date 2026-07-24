package com.zippy.backend.dto.response;

import java.util.List;

public class RecentOrdersResponse {

    private List<RecentOrderResponse> orders;

    public RecentOrdersResponse() {
    }

    public RecentOrdersResponse(List<RecentOrderResponse> orders) {
        this.orders = orders;
    }

    public List<RecentOrderResponse> getOrders() {
        return orders;
    }

    public void setOrders(List<RecentOrderResponse> orders) {
        this.orders = orders;
    }
}
