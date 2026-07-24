package com.zippy.backend.controller;

import com.zippy.backend.dto.RateResponse;
import com.zippy.backend.service.RateAggregationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders/{orderId}/rates")
@CrossOrigin(origins = "*")
public class RateController {

    private final RateAggregationService rateAggregationService;

    public RateController(RateAggregationService rateAggregationService) {
        this.rateAggregationService = rateAggregationService;
    }

    @PostMapping
    public ResponseEntity<RateResponse> fetchRates(
            @PathVariable String orderId,
            @RequestParam(name = "sort", required = false) String sortBy) {
        RateResponse response = rateAggregationService.fetchAndAggregateRates(orderId, sortBy);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<RateResponse> getCachedRates(
            @PathVariable String orderId,
            @RequestParam(name = "sort", required = false) String sortBy) {
        RateResponse response = rateAggregationService.getCachedRates(orderId, sortBy);
        return ResponseEntity.ok(response);
    }
}
