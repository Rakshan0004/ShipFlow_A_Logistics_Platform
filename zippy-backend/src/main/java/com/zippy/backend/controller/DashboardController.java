package com.zippy.backend.controller;

import com.zippy.backend.dto.response.DashboardStatsResponse;
import com.zippy.backend.dto.response.RecentOrdersResponse;
import com.zippy.backend.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "*")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsResponse> getDashboardStats() {
        DashboardStatsResponse stats = dashboardService.getDashboardStats();
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/recent-orders")
    public ResponseEntity<RecentOrdersResponse> getRecentOrders(
            @RequestParam(required = false, defaultValue = "10") Integer limit) {
        RecentOrdersResponse recentOrders = dashboardService.getRecentOrders(limit);
        return ResponseEntity.ok(recentOrders);
    }
}
