package com.database.auction.controllers;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
public class HealthController {

    @GetMapping("/")
    public Map<String, Object> root() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "✅ Vehicle Auction System Backend is running!");
        response.put("timestamp", LocalDateTime.now());
        response.put("version", "v1.0.0");
        response.put("endpoints", Map.of(
            "health", "/health",
            "auth", "/auth/**",
            "auction_items", "/auth/auction-items/summary"
        ));
        return response;
    }

    @GetMapping("/health")
    public Map<String, Object> health() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("timestamp", LocalDateTime.now());
        response.put("service", "auction-system");
        return response;
    }
} 