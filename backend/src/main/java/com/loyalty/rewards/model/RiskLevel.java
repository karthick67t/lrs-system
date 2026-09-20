package com.loyalty.rewards.model;

public enum RiskLevel {
    HIGH,
    MEDIUM,
    LOW;

    public static RiskLevel calculateLevel(int score) {
        if (score >= 75) return HIGH;
        if (score >= 40) return MEDIUM;
        return LOW;
    }
}
