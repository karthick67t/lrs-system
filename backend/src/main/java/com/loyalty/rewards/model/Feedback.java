package com.loyalty.rewards.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "feedback", indexes = {
    @Index(name = "idx_fb_customer", columnList = "customerId"),
    @Index(name = "idx_fb_rating", columnList = "rating"),
    @Index(name = "idx_fb_sentiment", columnList = "sentiment"),
    @Index(name = "idx_fb_status", columnList = "status"),
    @Index(name = "idx_fb_created", columnList = "createdAt")
})
public class Feedback {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long feedbackId;

    @Column(nullable = false)
    private Long customerId;

    private String customerName;

    @Column(nullable = false)
    private Integer rating; // 1 to 5

    @Column(length = 2000)
    private String comment;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private FeedbackType feedbackType = FeedbackType.GENERAL;

    private Long rewardId;
    private String rewardName;

    private Long partnerId;
    private String partnerName;

    private Long transactionId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Sentiment sentiment = Sentiment.NEUTRAL;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private FeedbackStatus status = FeedbackStatus.ACTIVE;

    private String reviewedBy;
    private LocalDateTime reviewedAt;

    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt = LocalDateTime.now();

    public Feedback() {}

    public Feedback(Long customerId, String customerName, Integer rating, String comment,
                    FeedbackType feedbackType, Long rewardId, String rewardName,
                    Long partnerId, String partnerName, Long transactionId,
                    Sentiment sentiment) {
        this.customerId = customerId;
        this.customerName = customerName;
        this.rating = rating;
        this.comment = comment;
        this.feedbackType = feedbackType != null ? feedbackType : FeedbackType.GENERAL;
        this.rewardId = rewardId;
        this.rewardName = rewardName;
        this.partnerId = partnerId;
        this.partnerName = partnerName;
        this.transactionId = transactionId;
        this.sentiment = sentiment != null ? sentiment : Sentiment.NEUTRAL;
        this.status = FeedbackStatus.ACTIVE;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public Long getFeedbackId() {
        return feedbackId;
    }

    public void setFeedbackId(Long feedbackId) {
        this.feedbackId = feedbackId;
    }

    public Long getCustomerId() {
        return customerId;
    }

    public void setCustomerId(Long customerId) {
        this.customerId = customerId;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public Integer getRating() {
        return rating;
    }

    public void setRating(Integer rating) {
        this.rating = rating;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }

    public FeedbackType getFeedbackType() {
        return feedbackType;
    }

    public void setFeedbackType(FeedbackType feedbackType) {
        this.feedbackType = feedbackType;
    }

    public Long getRewardId() {
        return rewardId;
    }

    public void setRewardId(Long rewardId) {
        this.rewardId = rewardId;
    }

    public String getRewardName() {
        return rewardName;
    }

    public void setRewardName(String rewardName) {
        this.rewardName = rewardName;
    }

    public Long getPartnerId() {
        return partnerId;
    }

    public void setPartnerId(Long partnerId) {
        this.partnerId = partnerId;
    }

    public String getPartnerName() {
        return partnerName;
    }

    public void setPartnerName(String partnerName) {
        this.partnerName = partnerName;
    }

    public Long getTransactionId() {
        return transactionId;
    }

    public void setTransactionId(Long transactionId) {
        this.transactionId = transactionId;
    }

    public Sentiment getSentiment() {
        return sentiment;
    }

    public void setSentiment(Sentiment sentiment) {
        this.sentiment = sentiment;
    }

    public FeedbackStatus getStatus() {
        return status;
    }

    public void setStatus(FeedbackStatus status) {
        this.status = status;
    }

    public String getReviewedBy() {
        return reviewedBy;
    }

    public void setReviewedBy(String reviewedBy) {
        this.reviewedBy = reviewedBy;
    }

    public LocalDateTime getReviewedAt() {
        return reviewedAt;
    }

    public void setReviewedAt(LocalDateTime reviewedAt) {
        this.reviewedAt = reviewedAt;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
