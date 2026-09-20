package com.loyalty.rewards.controller;

import com.loyalty.rewards.dto.FeedbackRequest;
import com.loyalty.rewards.model.*;
import com.loyalty.rewards.service.FeedbackService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/feedback")
@CrossOrigin
public class FeedbackController {

    @Autowired
    private FeedbackService feedbackService;

    private Member getAuthenticatedMember(Authentication authentication) {
        if (authentication != null && authentication.getPrincipal() instanceof Member) {
            return (Member) authentication.getPrincipal();
        }
        return null;
    }

    private void verifyManagerOrAdmin(Authentication authentication) {
        Member current = getAuthenticatedMember(authentication);
        if (current == null || (current.getRole() != Role.SUPER_ADMIN && current.getRole() != Role.LOYALTY_MANAGER)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access Denied: Requires LOYALTY_MANAGER or SUPER_ADMIN role.");
        }
    }

    // Customer Endpoints
    @PostMapping
    public ResponseEntity<Feedback> submitFeedback(@RequestBody FeedbackRequest request, Authentication authentication) {
        Member current = getAuthenticatedMember(authentication);
        if (current == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthenticated");
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(feedbackService.submitFeedback(request, current));
    }

    @GetMapping("/my")
    public ResponseEntity<List<Feedback>> getMyFeedback(Authentication authentication) {
        Member current = getAuthenticatedMember(authentication);
        if (current == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthenticated");
        }
        return ResponseEntity.ok(feedbackService.getMyFeedback(current));
    }

    @GetMapping("/my/{id}")
    public ResponseEntity<Feedback> getMyFeedbackById(@PathVariable Long id, Authentication authentication) {
        Member current = getAuthenticatedMember(authentication);
        if (current == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthenticated");
        }
        return ResponseEntity.ok(feedbackService.getMyFeedbackById(id, current));
    }

    // Manager / Admin Endpoints
    @GetMapping
    public ResponseEntity<List<Feedback>> getAllFeedback(Authentication authentication) {
        verifyManagerOrAdmin(authentication);
        return ResponseEntity.ok(feedbackService.getAllFeedback());
    }

    @GetMapping("/analytics")
    public ResponseEntity<Map<String, Object>> getFeedbackAnalytics(Authentication authentication) {
        verifyManagerOrAdmin(authentication);
        return ResponseEntity.ok(feedbackService.getAnalytics());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Feedback> getFeedbackById(@PathVariable Long id, Authentication authentication) {
        verifyManagerOrAdmin(authentication);
        return ResponseEntity.ok(feedbackService.getFeedbackById(id));
    }

    @GetMapping("/rating/{rating}")
    public ResponseEntity<List<Feedback>> getByRating(@PathVariable Integer rating, Authentication authentication) {
        verifyManagerOrAdmin(authentication);
        return ResponseEntity.ok(feedbackService.getByRating(rating));
    }

    @GetMapping("/sentiment/{sentiment}")
    public ResponseEntity<List<Feedback>> getBySentiment(@PathVariable Sentiment sentiment, Authentication authentication) {
        verifyManagerOrAdmin(authentication);
        return ResponseEntity.ok(feedbackService.getBySentiment(sentiment));
    }

    @GetMapping("/type/{type}")
    public ResponseEntity<List<Feedback>> getByType(@PathVariable FeedbackType type, Authentication authentication) {
        verifyManagerOrAdmin(authentication);
        return ResponseEntity.ok(feedbackService.getByType(type));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<Feedback>> getByStatus(@PathVariable FeedbackStatus status, Authentication authentication) {
        verifyManagerOrAdmin(authentication);
        return ResponseEntity.ok(feedbackService.getByStatus(status));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Feedback> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body, Authentication authentication) {
        verifyManagerOrAdmin(authentication);
        String statusStr = body != null ? body.get("status") : null;
        if (statusStr == null || statusStr.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Status is required.");
        }
        Member current = getAuthenticatedMember(authentication);
        return ResponseEntity.ok(feedbackService.updateStatus(id, statusStr, current));
    }
}
