package com.loyalty.rewards.dto;

public class RedeemRequest {
    private Long memberId;
    private Long rewardId;

    public RedeemRequest() {}

    public RedeemRequest(Long memberId, Long rewardId) {
        this.memberId = memberId;
        this.rewardId = rewardId;
    }

    public Long getMemberId() {
        return memberId;
    }

    public void setMemberId(Long memberId) {
        this.memberId = memberId;
    }

    public Long getRewardId() {
        return rewardId;
    }

    public void setRewardId(Long rewardId) {
        this.rewardId = rewardId;
    }
}
