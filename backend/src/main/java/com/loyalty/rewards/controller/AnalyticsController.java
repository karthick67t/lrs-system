package com.loyalty.rewards.controller;

import com.loyalty.rewards.model.Member;
import com.loyalty.rewards.model.Role;
import com.loyalty.rewards.service.AnalyticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
@CrossOrigin
public class AnalyticsController {

    @Autowired
    private AnalyticsService analyticsService;

    private Member getAuthenticatedMember(Authentication authentication) {
        if (authentication != null && authentication.getPrincipal() instanceof Member) {
            return (Member) authentication.getPrincipal();
        }
        return null;
    }

    private void checkAdminOrManager(Authentication authentication) {
        Member current = getAuthenticatedMember(authentication);
        if (current == null || (current.getRole() != Role.SUPER_ADMIN && current.getRole() != Role.LOYALTY_MANAGER)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access Denied: Only SUPER_ADMIN and LOYALTY_MANAGER can access business analytics.");
        }
    }

    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getSummary(Authentication authentication) {
        checkAdminOrManager(authentication);
        return ResponseEntity.ok(analyticsService.getSummaryMetrics());
    }

    @GetMapping("/points-trend")
    public ResponseEntity<List<Map<String, Object>>> getPointsTrend(
            @RequestParam(name = "range", required = false, defaultValue = "30d") String range,
            Authentication authentication) {
        checkAdminOrManager(authentication);
        return ResponseEntity.ok(analyticsService.getPointsTrend(range));
    }
}
