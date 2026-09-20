package com.loyalty.rewards.dto;

public class PointsRequest {
    private Double billAmount;
    private Integer points;
    private String description;

    public PointsRequest() {}

    public PointsRequest(Double billAmount, Integer points, String description) {
        this.billAmount = billAmount;
        this.points = points;
        this.description = description;
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

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}
