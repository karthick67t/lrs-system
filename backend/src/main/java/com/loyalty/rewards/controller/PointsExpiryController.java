package com.loyalty.rewards.controller;

import com.loyalty.rewards.model.Member;
import com.loyalty.rewards.model.PointLot;
import com.loyalty.rewards.model.Role;
import com.loyalty.rewards.service.PointsExpiryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/points-expiry")
@CrossOrigin
public class PointsExpiryController {

    @Autowired
    private PointsExpiryService pointsExpiryService;

    private Member getAuthenticatedMember(Authentication authentication) {
        if (authentication != null && authentication.getPrincipal() instanceof Member) {
            return (Member) authentication.getPrincipal();
        }
        return null;
    }

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<Map<String, Object>> getCustomerExpiryInfo(
            @PathVariable Long customerId,
            Authentication authentication) {
        
        Member current = getAuthenticatedMember(authentication);
        if (current != null && current.getRole() == Role.CUSTOMER && !current.getMemberId().equals(customerId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Customers can only view their own points expiry details.");
        }

        List<Map<String, Object>> upcoming = pointsExpiryService.getUpcomingExpiriesCustomer(customerId);
        List<PointLot> allLots = pointsExpiryService.getCustomerLots(customerId);

        int totalExpiringSoon = upcoming.stream().mapToInt(u -> (Integer) u.get("remainingPoints")).sum();
        Object nextExpiryDate = upcoming.isEmpty() ? null : upcoming.get(0).get("expiryDate");

        return ResponseEntity.ok(Map.of(
            "customerId", customerId,
            "totalExpiringSoon", totalExpiringSoon,
            "nextExpiryDate", nextExpiryDate != null ? nextExpiryDate : "None",
            "upcomingLots", upcoming,
            "allLots", allLots
        ));
    }

    @GetMapping("/upcoming")
    public ResponseEntity<List<Map<String, Object>>> getUpcomingExpiries(Authentication authentication) {
        Member current = getAuthenticatedMember(authentication);
        if (current != null && current.getRole() == Role.CUSTOMER) {
            return ResponseEntity.ok(pointsExpiryService.getUpcomingExpiriesCustomer(current.getMemberId()));
        }
        return ResponseEntity.ok(pointsExpiryService.getUpcomingExpiriesGlobal());
    }

    @PostMapping("/process")
    public ResponseEntity<Map<String, Object>> processExpiries(Authentication authentication) {
        Member current = getAuthenticatedMember(authentication);
        if (current != null && current.getRole() == Role.CUSTOMER) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Customers cannot trigger global point expiries.");
        }
        return ResponseEntity.ok(pointsExpiryService.processExpiries());
    }
}
