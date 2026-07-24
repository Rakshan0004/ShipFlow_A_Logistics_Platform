package com.zippy.backend.service;

import com.zippy.backend.dto.response.DashboardStatsResponse;
import com.zippy.backend.dto.response.RecentOrderResponse;
import com.zippy.backend.dto.response.RecentOrdersResponse;
import com.zippy.backend.model.Order;
import com.zippy.backend.model.Shipment;
import com.zippy.backend.repository.OrderRepository;
import com.zippy.backend.repository.ShipmentRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    private final OrderRepository orderRepository;
    private final ShipmentRepository shipmentRepository;

    public DashboardService(OrderRepository orderRepository, ShipmentRepository shipmentRepository) {
        this.orderRepository = orderRepository;
        this.shipmentRepository = shipmentRepository;
    }

    public DashboardStatsResponse getDashboardStats() {
        // Get all orders and shipments
        List<Order> allOrders = orderRepository.findAll();
        List<Shipment> allShipments = shipmentRepository.findAll();

        // Calculate total orders
        Long totalOrders = (long) allOrders.size();

        // Calculate active shipments (not in terminal states)
        Set<String> terminalStates = Set.of("DELIVERED", "RTO", "DELIVERY_FAILED", "CANCELLED");
        Long activeShipments = allShipments.stream()
                .filter(s -> !terminalStates.contains(s.getCurrentStatus()))
                .count();

        // Calculate delivered today
        LocalDate today = LocalDate.now(ZoneId.systemDefault());
        Long deliveredToday = allOrders.stream()
                .filter(o -> "DELIVERED".equals(o.getOrderStatus()))
                .filter(o -> {
                    LocalDate updatedDate = o.getUpdatedAt()
                            .atZone(ZoneId.systemDefault())
                            .toLocalDate();
                    return updatedDate.equals(today);
                })
                .count();

        // Calculate total revenue (sum of COD amounts for delivered orders)
        BigDecimal totalRevenue = allOrders.stream()
                .filter(o -> "DELIVERED".equals(o.getOrderStatus()))
                .map(o -> o.getCodAmount() != null ? o.getCodAmount() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Calculate courier breakdown
        Map<String, Long> courierBreakdown = allShipments.stream()
                .collect(Collectors.groupingBy(
                        Shipment::getCarrierCode,
                        Collectors.counting()
                ));

        // Calculate status breakdown
        Map<String, Long> statusBreakdown = allOrders.stream()
                .collect(Collectors.groupingBy(
                        Order::getOrderStatus,
                        Collectors.counting()
                ));

        return new DashboardStatsResponse(
                totalOrders,
                activeShipments,
                deliveredToday,
                totalRevenue,
                courierBreakdown,
                statusBreakdown
        );
    }

    public RecentOrdersResponse getRecentOrders(Integer limit) {
        // Default limit to 10 if not provided, max 50
        int effectiveLimit = limit != null ? Math.min(limit, 50) : 10;

        // Fetch recent orders sorted by creation date descending
        PageRequest pageRequest = PageRequest.of(0, effectiveLimit, Sort.by(Sort.Direction.DESC, "createdAt"));
        List<Order> recentOrders = orderRepository.findAll(pageRequest).getContent();

        // Map to DTOs
        List<RecentOrderResponse> orderResponses = recentOrders.stream()
                .map(order -> new RecentOrderResponse(
                        order.getZippyOrderId(),
                        order.getMerchantOrderId(),
                        order.getCustomerName(),
                        order.getOrderStatus(),
                        order.getCreatedAt(),
                        order.getDeliveryCity()
                ))
                .collect(Collectors.toList());

        return new RecentOrdersResponse(orderResponses);
    }
}
