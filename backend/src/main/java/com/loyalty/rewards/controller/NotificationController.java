package com.loyalty.rewards.controller;

import com.loyalty.rewards.model.Member;
import com.loyalty.rewards.model.Notification;
import com.loyalty.rewards.model.NotificationStatus;
import com.loyalty.rewards.model.Role;
import com.loyalty.rewards.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    private Member getAuthenticatedMember(Authentication authentication) {
        if (authentication != null && authentication.getPrincipal() instanceof Member) {
            return (Member) authentication.getPrincipal();
        }
        return null;
    }

    @GetMapping
    public ResponseEntity<List<Notification>> getAllNotifications(Authentication authentication) {
        Member current = getAuthenticatedMember(authentication);
        List<Notification> all = notificationService.getAllNotifications();
        if (current == null) {
            return ResponseEntity.ok(all);
        }

        if (current.getRole() == Role.SUPER_ADMIN) {
            return ResponseEntity.ok(all);
        }

        if (current.getRole() == Role.CUSTOMER) {
            // CUSTOMER gets personal or ALL notifications excluding ANNOUNCEMENT
            List<Notification> customerList = all.stream()
                    .filter(n -> !"ANNOUNCEMENT".equalsIgnoreCase(n.getType()))
                    .filter(n -> {
                        if ("ALL".equalsIgnoreCase(n.getAudience())) return true;
                        if (current.getEmail() != null && current.getEmail().equalsIgnoreCase(n.getAudience())) return true;
                        if (n.getRecipientId() != null && n.getRecipientId().equals(current.getMemberId())) return true;
                        return false;
                    })
                    .collect(Collectors.toList());
            return ResponseEntity.ok(customerList);
        }

        // LOYALTY_MANAGER & STAFF get relevant notifications + ANNOUNCEMENT sent to them
        List<Notification> staffOrManagerList = all.stream()
                .filter(n -> {
                    if ("ANNOUNCEMENT".equalsIgnoreCase(n.getType())) {
                        if (n.getRecipientId() != null && n.getRecipientId().equals(current.getMemberId())) return true;
                        if (n.getRecipientRole() != null && n.getRecipientRole().equalsIgnoreCase(current.getRole().name())) return true;
                        if (current.getEmail() != null && current.getEmail().equalsIgnoreCase(n.getAudience())) return true;
                        return false;
                    }
                    if ("ALL".equalsIgnoreCase(n.getAudience())) return true;
                    if (current.getRole() != null && current.getRole().name().equalsIgnoreCase(n.getAudience())) return true;
                    if (current.getEmail() != null && current.getEmail().equalsIgnoreCase(n.getAudience())) return true;
                    if (n.getRecipientId() != null && n.getRecipientId().equals(current.getMemberId())) return true;
                    return false;
                })
                .collect(Collectors.toList());
        return ResponseEntity.ok(staffOrManagerList);
    }

    @PostMapping("/announcement")
    public ResponseEntity<Map<String, Object>> sendAnnouncement(
            @RequestBody Map<String, String> body,
            Authentication authentication) {
        
        Member current = getAuthenticatedMember(authentication);
        if (current == null || current.getRole() != Role.SUPER_ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access Denied: Only SUPER_ADMIN users can send system announcements.");
        }

        String title = body != null ? body.get("title") : null;
        String message = body != null ? body.get("message") : null;

        Map<String, Object> result = notificationService.sendAnnouncement(title, message, current);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Notification> getNotificationById(@PathVariable Long id) {
        return ResponseEntity.ok(notificationService.getNotificationById(id));
    }

    @PostMapping
    public ResponseEntity<Notification> createNotification(@RequestBody Notification notification, Authentication authentication) {
        Member current = getAuthenticatedMember(authentication);
        if (current == null || current.getRole() != Role.SUPER_ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access Denied: Only SUPER_ADMIN users can create notification campaigns.");
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(notificationService.createNotification(notification));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Notification> updateNotification(@PathVariable Long id, @RequestBody Notification details, Authentication authentication) {
        Member current = getAuthenticatedMember(authentication);
        if (current == null || current.getRole() != Role.SUPER_ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access Denied: Only SUPER_ADMIN users can update notifications.");
        }
        return ResponseEntity.ok(notificationService.updateNotification(id, details));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNotification(@PathVariable Long id, Authentication authentication) {
        Member current = getAuthenticatedMember(authentication);
        if (current == null || current.getRole() != Role.SUPER_ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access Denied: Only SUPER_ADMIN users can delete notifications.");
        }
        notificationService.deleteNotification(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/send")
    public ResponseEntity<Notification> sendNotification(@PathVariable Long id, Authentication authentication) {
        Member current = getAuthenticatedMember(authentication);
        if (current == null || current.getRole() != Role.SUPER_ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access Denied: Only SUPER_ADMIN users can send notifications.");
        }
        return ResponseEntity.ok(notificationService.sendNotification(id));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<Notification> cancelNotification(@PathVariable Long id, Authentication authentication) {
        Member current = getAuthenticatedMember(authentication);
        if (current == null || current.getRole() != Role.SUPER_ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access Denied: Only SUPER_ADMIN users can cancel notifications.");
        }
        return ResponseEntity.ok(notificationService.cancelNotification(id));
    }

    @GetMapping("/search")
    public ResponseEntity<List<Notification>> searchByTitle(@RequestParam(name = "title", required = false) String title) {
        if (title == null || title.isBlank()) return ResponseEntity.ok(notificationService.getAllNotifications());
        return ResponseEntity.ok(notificationService.searchByTitle(title));
    }

    @GetMapping("/type/{type}")
    public ResponseEntity<List<Notification>> getByType(@PathVariable String type) {
        return ResponseEntity.ok(notificationService.getByType(type));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<Notification>> getByStatus(@PathVariable NotificationStatus status) {
        return ResponseEntity.ok(notificationService.getByStatus(status));
    }

    @GetMapping("/audience/{audience}")
    public ResponseEntity<List<Notification>> getByAudience(@PathVariable String audience) {
        return ResponseEntity.ok(notificationService.getByAudience(audience));
    }
}
