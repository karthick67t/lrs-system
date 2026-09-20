package com.loyalty.rewards.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "fraud_alerts")
public class Fraud {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long fraudId;

    private Long customerId;
    private String customerName;

    private Long transactionId;

    private Long performedByUserId;
    private String performedByName;

    @Enumerated(EnumType.STRING)
    private Role performedByRole;

    @Column(nullable = false)
    private Integer riskScore;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RiskLevel riskLevel;

    private String detectedRules; // Comma-separated or JSON list of rules

    private String description;

    @Column(nullable = false)
    private String status = "OPEN"; // OPEN, UNDER_REVIEW, CONFIRMED, FALSE_POSITIVE, BLOCKED, RESOLVED

    @Column(nullable = true)
    private LocalDateTime detectedAt = LocalDateTime.now();

    private String reviewedBy;
    private LocalDateTime reviewedAt;

    public Fraud() {}

    public Fraud(Member member, Integer riskScore, String fraudType, String status, String description) {
        this.customerId = (member != null) ? member.getMemberId() : null;
        this.customerName = (member != null) ? member.getFullName() : "Unknown Member";
        this.riskScore = Math.min(100, Math.max(0, riskScore != null ? riskScore : 0));
        this.riskLevel = RiskLevel.calculateLevel(this.riskScore);
        this.detectedRules = fraudType;
        this.status = (status != null) ? status : "OPEN";
        this.description = description;
        this.detectedAt = LocalDateTime.now();
    }

    public Fraud(Long customerId, String customerName, Long transactionId,
                 Long performedByUserId, String performedByName, Role performedByRole,
                 Integer riskScore, String detectedRules, String description) {
        this.customerId = customerId;
        this.customerName = customerName;
        this.transactionId = transactionId;
        this.performedByUserId = performedByUserId;
        this.performedByName = performedByName;
        this.performedByRole = performedByRole;
        this.riskScore = Math.min(100, Math.max(0, riskScore != null ? riskScore : 0));
        this.riskLevel = RiskLevel.calculateLevel(this.riskScore);
        this.detectedRules = detectedRules;
        this.description = description;
        this.status = "OPEN";
        this.detectedAt = LocalDateTime.now();
    }

    public Long getFraudId() {
        return fraudId;
    }

    public void setFraudId(Long fraudId) {
        this.fraudId = fraudId;
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

    public Long getTransactionId() {
        return transactionId;
    }

    public void setTransactionId(Long transactionId) {
        this.transactionId = transactionId;
    }

    public Long getPerformedByUserId() {
        return performedByUserId;
    }

    public void setPerformedByUserId(Long performedByUserId) {
        this.performedByUserId = performedByUserId;
    }

    public String getPerformedByName() {
        return performedByName;
    }

    public void setPerformedByName(String performedByName) {
        this.performedByName = performedByName;
    }

    public Role getPerformedByRole() {
        return performedByRole;
    }

    public void setPerformedByRole(Role performedByRole) {
        this.performedByRole = performedByRole;
    }

    public Integer getRiskScore() {
        return riskScore;
    }

    public void setRiskScore(Integer riskScore) {
        this.riskScore = Math.min(100, Math.max(0, riskScore != null ? riskScore : 0));
        this.riskLevel = RiskLevel.calculateLevel(this.riskScore);
    }

    public RiskLevel getRiskLevel() {
        return riskLevel;
    }

    public void setRiskLevel(RiskLevel riskLevel) {
        this.riskLevel = riskLevel;
    }

    public String getDetectedRules() {
        return detectedRules;
    }

    public void setDetectedRules(String detectedRules) {
        this.detectedRules = detectedRules;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getDetectedAt() {
        return detectedAt;
    }

    public void setDetectedAt(LocalDateTime detectedAt) {
        this.detectedAt = detectedAt;
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
}
