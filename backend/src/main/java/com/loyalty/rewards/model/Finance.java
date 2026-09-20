package com.loyalty.rewards.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "finance_ledger")
public class Finance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long financeId;

    private Long transactionId;

    private String type; // REVENUE, LIABILITY, ISSUANCE_COST

    private String description;

    @Column(nullable = false)
    private Double amount;

    private Integer points;

    private String status = "SETTLED";

    private LocalDateTime date = LocalDateTime.now();

    public Finance() {}

    public Finance(Long transactionId, String type, String description, Double amount, Integer points, String status, LocalDateTime date) {
        this.transactionId = transactionId;
        this.type = type;
        this.description = description;
        this.amount = amount != null ? amount : 0.0;
        this.points = points != null ? points : 0;
        this.status = status != null ? status : "SETTLED";
        this.date = date != null ? date : LocalDateTime.now();
    }

    public Long getFinanceId() {
        return financeId;
    }

    public void setFinanceId(Long financeId) {
        this.financeId = financeId;
    }

    public Long getTransactionId() {
        return transactionId;
    }

    public void setTransactionId(Long transactionId) {
        this.transactionId = transactionId;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Double getAmount() {
        return amount;
    }

    public void setAmount(Double amount) {
        this.amount = amount;
    }

    public Integer getPoints() {
        return points;
    }

    public void setPoints(Integer points) {
        this.points = points;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getDate() {
        return date;
    }

    public void setDate(LocalDateTime date) {
        this.date = date;
    }
}
