package com.loyalty.rewards.model;

public enum Tier {
    BRONZE,
    SILVER,
    GOLD,
    PLATINUM;

    public static Tier calculateTier(int points) {
        if (points >= 5000) return PLATINUM;
        if (points >= 2500) return GOLD;
        if (points >= 1000) return SILVER;
        return BRONZE;
    }
}
