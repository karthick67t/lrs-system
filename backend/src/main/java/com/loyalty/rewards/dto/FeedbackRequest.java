package com.loyalty.rewards.dto;

import com.loyalty.rewards.model.FeedbackType;

public class FeedbackRequest {
    private Integer rating;
    private String comment;
    private FeedbackType feedbackType;
    private Long rewardId;
    private Long partnerId;
    private Long transactionId;

    public FeedbackRequest() {}

    public FeedbackRequest(Integer rating, String comment, FeedbackType feedbackType, Long rewardId, Long partnerId, Long transactionId) {
        this.rating = rating;
        this.comment = comment;
        this.feedbackType = feedbackType;
        this.rewardId = rewardId;
        this.partnerId = partnerId;
        this.transactionId = transactionId;
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

    public Long getPartnerId() {
        return partnerId;
    }

    public void setPartnerId(Long partnerId) {
        this.partnerId = partnerId;
    }

    public Long getTransactionId() {
        return transactionId;
    }

    public void setTransactionId(Long transactionId) {
        this.transactionId = transactionId;
    }
}
