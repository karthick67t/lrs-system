package com.loyalty.rewards.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long notificationId;

    @Column(nullable = false)
    private String title;

    private String message;

    private String type; // PROMOTIONAL, SYSTEM, TIER_UPDATE, REMINDER

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationStatus status = NotificationStatus.SCHEDULED;

    private String audience; // ALL, BRONZE, SILVER, GOLD, PLATINUM

    private LocalDateTime scheduledDate = LocalDateTime.now();

    private Long recipientId;

    private String recipientRole;

    public Notification() {}

    public Notification(String title, String message, String type, NotificationStatus status, String audience, LocalDateTime scheduledDate) {
        this.title = title;
        this.message = message;
        this.type = type;
        this.status = status != null ? status : NotificationStatus.SCHEDULED;
        this.audience = audience != null ? audience : "ALL";
        this.scheduledDate = scheduledDate != null ? scheduledDate : LocalDateTime.now();
    }

    public Notification(String title, String message, String type) {
        this(title, message, type, NotificationStatus.SENT, "ALL", LocalDateTime.now());
    }

    public Notification(Member member, String title, String message, String type) {
        this(title, message, type, NotificationStatus.SENT, member != null ? member.getEmail() : "ALL", LocalDateTime.now());
        if (member != null) {
            this.recipientId = member.getMemberId();
            this.recipientRole = member.getRole() != null ? member.getRole().name() : null;
        }
    }

    public Long getNotificationId() {
        return notificationId;
    }

    public void setNotificationId(Long notificationId) {
        this.notificationId = notificationId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public NotificationStatus getStatus() {
        return status;
    }

    public void setStatus(NotificationStatus status) {
        this.status = status;
    }

    public String getAudience() {
        return audience;
    }

    public void setAudience(String audience) {
        this.audience = audience;
    }

    public LocalDateTime getScheduledDate() {
        return scheduledDate;
    }

    public void setScheduledDate(LocalDateTime scheduledDate) {
        this.scheduledDate = scheduledDate;
    }

    public Long getRecipientId() {
        return recipientId;
    }

    public void setRecipientId(Long recipientId) {
        this.recipientId = recipientId;
    }

    public String getRecipientRole() {
        return recipientRole;
    }

    public void setRecipientRole(String recipientRole) {
        this.recipientRole = recipientRole;
    }
}
