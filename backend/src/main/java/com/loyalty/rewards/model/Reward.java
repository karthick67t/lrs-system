package com.loyalty.rewards.model;

import jakarta.persistence.*;

@Entity
@Table(name = "rewards")
public class Reward {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long rewardId;

    @Column(nullable = false)
    private String name;

    private String description;

    @Column(nullable = false)
    private Integer pointsRequired;

    @Column(nullable = false)
    private Integer stock = 0;

    private String category;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status = Status.ACTIVE;

    public Reward() {}

    public Reward(String name, String description, Integer pointsRequired, Integer stock, String category, Status status) {
        this.name = name;
        this.description = description;
        this.pointsRequired = pointsRequired;
        this.stock = stock != null ? stock : 0;
        this.category = category;
        this.status = status != null ? status : Status.ACTIVE;
    }

    public Long getRewardId() {
        return rewardId;
    }

    public void setRewardId(Long rewardId) {
        this.rewardId = rewardId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Integer getPointsRequired() {
        return pointsRequired;
    }

    public void setPointsRequired(Integer pointsRequired) {
        this.pointsRequired = pointsRequired;
    }

    public Integer getStock() {
        return stock;
    }

    public void setStock(Integer stock) {
        this.stock = stock;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public Status getStatus() {
        return status;
    }

    public void setStatus(Status status) {
        this.status = status;
    }
}
