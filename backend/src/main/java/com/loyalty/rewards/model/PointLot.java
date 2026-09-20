package com.loyalty.rewards.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "point_lots")
public class PointLot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long customerId;

    @Column(nullable = false)
    private Integer earnedPoints;

    @Column(nullable = false)
    private Integer remainingPoints;

    @Column(nullable = false)
    private LocalDateTime earnedDate = LocalDateTime.now();

    @Column(nullable = false)
    private LocalDateTime expiryDate;

    private Long sourceTransactionId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PointLotStatus status = PointLotStatus.ACTIVE;

    public PointLot() {}

    public PointLot(Long customerId, Integer earnedPoints, LocalDateTime expiryDate, Long sourceTransactionId) {
        this.customerId = customerId;
        this.earnedPoints = earnedPoints;
        this.remainingPoints = earnedPoints;
        this.earnedDate = LocalDateTime.now();
        this.expiryDate = expiryDate;
        this.sourceTransactionId = sourceTransactionId;
        this.status = PointLotStatus.ACTIVE;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getCustomerId() {
        return customerId;
    }

    public void setCustomerId(Long customerId) {
        this.customerId = customerId;
    }

    public Integer getEarnedPoints() {
        return earnedPoints;
    }

    public void setEarnedPoints(Integer earnedPoints) {
        this.earnedPoints = earnedPoints;
    }

    public Integer getRemainingPoints() {
        return remainingPoints;
    }

    public void setRemainingPoints(Integer remainingPoints) {
        this.remainingPoints = remainingPoints;
    }

    public LocalDateTime getEarnedDate() {
        return earnedDate;
    }

    public void setEarnedDate(LocalDateTime earnedDate) {
        this.earnedDate = earnedDate;
    }

    public LocalDateTime getExpiryDate() {
        return expiryDate;
    }

    public void setExpiryDate(LocalDateTime expiryDate) {
        this.expiryDate = expiryDate;
    }

    public Long getSourceTransactionId() {
        return sourceTransactionId;
    }

    public void setSourceTransactionId(Long sourceTransactionId) {
        this.sourceTransactionId = sourceTransactionId;
    }

    public PointLotStatus getStatus() {
        return status;
    }

    public void setStatus(PointLotStatus status) {
        this.status = status;
    }
}
