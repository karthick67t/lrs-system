package com.loyalty.rewards.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "transactions")
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long transactionId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;

    @Column(nullable = false)
    private Integer points;

    private Double billAmount;

    private Integer previousBalance;

    private Integer newBalance;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TransactionType transactionType;

    private String description;

    private Long performedByUserId;

    private String performedByName;

    @Enumerated(EnumType.STRING)
    private Role performedByRole;

    @Column(nullable = false)
    private LocalDateTime transactionDate = LocalDateTime.now();

    public Transaction() {}

    public Transaction(Member member, Integer points, Integer previousBalance, Integer newBalance,
                       TransactionType transactionType, String description,
                       Long performedByUserId, String performedByName, Role performedByRole) {
        this.member = member;
        this.points = points;
        this.previousBalance = previousBalance;
        this.newBalance = newBalance;
        this.transactionType = transactionType;
        this.description = description;
        this.performedByUserId = performedByUserId;
        this.performedByName = performedByName;
        this.performedByRole = performedByRole;
        this.transactionDate = LocalDateTime.now();
    }

    public Transaction(Member member, Double billAmount, Integer points, Integer previousBalance, Integer newBalance,
                       TransactionType transactionType, String description,
                       Long performedByUserId, String performedByName, Role performedByRole) {
        this.member = member;
        this.billAmount = billAmount;
        this.points = points;
        this.previousBalance = previousBalance;
        this.newBalance = newBalance;
        this.transactionType = transactionType;
        this.description = description;
        this.performedByUserId = performedByUserId;
        this.performedByName = performedByName;
        this.performedByRole = performedByRole;
        this.transactionDate = LocalDateTime.now();
    }

    public Long getTransactionId() {
        return transactionId;
    }

    public void setTransactionId(Long transactionId) {
        this.transactionId = transactionId;
    }

    public Member getMember() {
        return member;
    }

    public void setMember(Member member) {
        this.member = member;
    }

    public Double getBillAmount() {
        return billAmount;
    }

    public void setBillAmount(Double billAmount) {
        this.billAmount = billAmount;
    }

    public Integer getPoints() {
        return points;
    }

    public void setPoints(Integer points) {
        this.points = points;
    }

    public Integer getPreviousBalance() {
        return previousBalance;
    }

    public void setPreviousBalance(Integer previousBalance) {
        this.previousBalance = previousBalance;
    }

    public Integer getNewBalance() {
        return newBalance;
    }

    public void setNewBalance(Integer newBalance) {
        this.newBalance = newBalance;
    }

    public TransactionType getTransactionType() {
        return transactionType;
    }

    public void setTransactionType(TransactionType transactionType) {
        this.transactionType = transactionType;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
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

    public Long getCustomerId() {
        return member != null ? member.getMemberId() : null;
    }

    public String getCustomerName() {
        return member != null ? member.getFullName() : null;
    }

    public LocalDateTime getTransactionDate() {
        return transactionDate;
    }

    public void setTransactionDate(LocalDateTime transactionDate) {
        this.transactionDate = transactionDate;
    }
}
