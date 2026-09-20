package com.loyalty.rewards.controller;

import com.loyalty.rewards.model.Fraud;
import com.loyalty.rewards.model.Member;
import com.loyalty.rewards.model.Role;
import com.loyalty.rewards.service.FraudService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/fraud")
@CrossOrigin
public class FraudController {

    @Autowired
    private FraudService fraudService;

    private Member getAuthenticatedMember(Authentication authentication) {
        if (authentication != null && authentication.getPrincipal() instanceof Member) {
            return (Member) authentication.getPrincipal();
        }
        return null;
    }

    private void checkAdminOrManager(Authentication authentication) {
        Member current = getAuthenticatedMember(authentication);
        if (current == null || (current.getRole() != Role.SUPER_ADMIN && current.getRole() != Role.LOYALTY_MANAGER)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access Denied: Only SUPER_ADMIN and LOYALTY_MANAGER can access fraud administration.");
        }
    }

    @GetMapping
    public ResponseEntity<List<Fraud>> getAllFraudRecords(Authentication authentication) {
        checkAdminOrManager(authentication);
        return ResponseEntity.ok(fraudService.getAllFraudRecords());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Fraud> getFraudById(@PathVariable Long id, Authentication authentication) {
        checkAdminOrManager(authentication);
        return ResponseEntity.ok(fraudService.getFraudById(id));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Fraud> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            Authentication authentication) {
        
        checkAdminOrManager(authentication);
        Member current = getAuthenticatedMember(authentication);
        String newStatus = body.get("status");
        if (newStatus == null || newStatus.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Status field is required.");
        }

        String reviewer = (current != null) ? current.getFullName() : "Admin";
        return ResponseEntity.ok(fraudService.updateStatus(id, newStatus, reviewer));
    }

    @PutMapping("/{id}/review")
    public ResponseEntity<Fraud> markUnderReview(@PathVariable Long id, Authentication authentication) {
        checkAdminOrManager(authentication);
        Member current = getAuthenticatedMember(authentication);
        String reviewer = (current != null) ? current.getFullName() : "Admin";
        return ResponseEntity.ok(fraudService.updateStatus(id, "UNDER_REVIEW", reviewer));
    }

    @PutMapping("/{id}/confirm")
    public ResponseEntity<Fraud> confirmFraud(@PathVariable Long id, Authentication authentication) {
        checkAdminOrManager(authentication);
        Member current = getAuthenticatedMember(authentication);
        String reviewer = (current != null) ? current.getFullName() : "Admin";
        return ResponseEntity.ok(fraudService.updateStatus(id, "CONFIRMED", reviewer));
    }

    @PutMapping("/{id}/false-positive")
    public ResponseEntity<Fraud> markFalsePositive(@PathVariable Long id, Authentication authentication) {
        checkAdminOrManager(authentication);
        Member current = getAuthenticatedMember(authentication);
        String reviewer = (current != null) ? current.getFullName() : "Admin";
        return ResponseEntity.ok(fraudService.updateStatus(id, "FALSE_POSITIVE", reviewer));
    }

    @PutMapping("/{id}/block")
    public ResponseEntity<Fraud> blockCustomer(@PathVariable Long id, Authentication authentication) {
        checkAdminOrManager(authentication);
        Member current = getAuthenticatedMember(authentication);
        String reviewer = (current != null) ? current.getFullName() : "Admin";
        return ResponseEntity.ok(fraudService.updateStatus(id, "BLOCKED", reviewer));
    }

    @PutMapping("/{id}/resolve")
    public ResponseEntity<Fraud> resolveCase(@PathVariable Long id, Authentication authentication) {
        checkAdminOrManager(authentication);
        Member current = getAuthenticatedMember(authentication);
        String reviewer = (current != null) ? current.getFullName() : "Admin";
        return ResponseEntity.ok(fraudService.updateStatus(id, "RESOLVED", reviewer));
    }
}
