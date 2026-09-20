package com.loyalty.rewards.service;

import com.loyalty.rewards.model.*;
import com.loyalty.rewards.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AnalyticsService {

    @Autowired
    private MemberRepository memberRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private RewardRepository rewardRepository;

    @Autowired
    private FraudRepository fraudRepository;

    @Autowired
    private PointLotRepository pointLotRepository;

    public Map<String, Object> getSummaryMetrics() {
        List<Member> allMembers = memberRepository.findAll();
        List<Transaction> allTransactions = transactionRepository.findAll();
        List<Reward> allRewards = rewardRepository.findAll();
        List<Fraud> allFraud = fraudRepository.findAll();

        List<Member> customers = allMembers.stream()
                .filter(m -> m.getRole() == Role.CUSTOMER)
                .collect(Collectors.toList());

        long totalCustomers = customers.size();
        long activeCustomers = customers.stream().filter(m -> m.getStatus() == Status.ACTIVE).count();

        long totalPointsIssued = allTransactions.stream()
                .filter(t -> t.getTransactionType() == TransactionType.EARN)
                .mapToLong(t -> t.getPoints() != null ? t.getPoints() : 0)
                .sum();

        long totalPointsRedeemed = allTransactions.stream()
                .filter(t -> t.getTransactionType() == TransactionType.REDEEM)
                .mapToLong(t -> t.getPoints() != null ? t.getPoints() : 0)
                .sum();

        long totalPointsExpired = allTransactions.stream()
                .filter(t -> t.getTransactionType() == TransactionType.EXPIRED)
                .mapToLong(t -> t.getPoints() != null ? t.getPoints() : 0)
                .sum();

        long totalRewardsRedeemedCount = allTransactions.stream()
                .filter(t -> t.getTransactionType() == TransactionType.REDEEM)
                .count();

        double redemptionRate = totalPointsIssued > 0
                ? Math.round(((double) totalPointsRedeemed / totalPointsIssued) * 1000.0) / 10.0
                : 0.0;

        double avgCustomerPoints = totalCustomers > 0
                ? Math.round((double) customers.stream().mapToInt(m -> m.getPoints() != null ? m.getPoints() : 0).sum() / totalCustomers)
                : 0.0;

        // Tier Counts
        long countBronze = customers.stream().filter(m -> m.getTier() == Tier.BRONZE).count();
        long countSilver = customers.stream().filter(m -> m.getTier() == Tier.SILVER).count();
        long countGold = customers.stream().filter(m -> m.getTier() == Tier.GOLD).count();
        long countPlatinum = customers.stream().filter(m -> m.getTier() == Tier.PLATINUM).count();

        // Expiring Soon (7 and 30 days)
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime in7Days = now.plusDays(7);
        LocalDateTime in30Days = now.plusDays(30);

        List<PointLot> lots7 = pointLotRepository.findUpcomingExpiringLots(now, in7Days);
        List<PointLot> lots30 = pointLotRepository.findUpcomingExpiringLots(now, in30Days);

        int pointsExpiring7 = lots7.stream().mapToInt(p -> p.getRemainingPoints() != null ? p.getRemainingPoints() : 0).sum();
        int pointsExpiring30 = lots30.stream().mapToInt(p -> p.getRemainingPoints() != null ? p.getRemainingPoints() : 0).sum();

        // Fraud metrics
        long totalFraudIncidents = allFraud.size();
        long highRiskCases = allFraud.stream().filter(f -> f.getRiskLevel() == RiskLevel.HIGH).count();

        Map<String, Object> summary = new HashMap<>();
        summary.put("totalCustomers", totalCustomers);
        summary.put("activeCustomers", activeCustomers);
        summary.put("totalPointsIssued", totalPointsIssued);
        summary.put("totalPointsRedeemed", totalPointsRedeemed);
        summary.put("totalPointsExpired", totalPointsExpired);
        summary.put("totalRewardsRedeemed", totalRewardsRedeemedCount);
        summary.put("redemptionRate", redemptionRate);
        summary.put("avgCustomerPoints", avgCustomerPoints);

        summary.put("countBronze", countBronze);
        summary.put("countSilver", countSilver);
        summary.put("countGold", countGold);
        summary.put("countPlatinum", countPlatinum);

        summary.put("pointsExpiring7Days", pointsExpiring7);
        summary.put("pointsExpiring30Days", pointsExpiring30);

        summary.put("totalFraudIncidents", totalFraudIncidents);
        summary.put("highRiskCases", highRiskCases);

        return summary;
    }

    public List<Map<String, Object>> getPointsTrend(String timeframe) {
        List<Transaction> allTx = transactionRepository.findAll();
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime start;

        if ("7d".equalsIgnoreCase(timeframe)) start = now.minusDays(7);
        else if ("3m".equalsIgnoreCase(timeframe)) start = now.minusMonths(3);
        else if ("1y".equalsIgnoreCase(timeframe)) start = now.minusYears(1);
        else start = now.minusDays(30); // default 30d

        List<Transaction> filtered = allTx.stream()
                .filter(t -> t.getTransactionDate() != null && t.getTransactionDate().isAfter(start))
                .collect(Collectors.toList());

        Map<String, Map<String, Long>> grouped = new LinkedHashMap<>();
        for (Transaction t : filtered) {
            String dateKey = t.getTransactionDate().toLocalDate().toString();
            grouped.computeIfAbsent(dateKey, k -> new HashMap<>());
            String type = t.getTransactionType().name();
            long pts = t.getPoints() != null ? t.getPoints() : 0;
            grouped.get(dateKey).put(type, grouped.get(dateKey).getOrDefault(type, 0L) + pts);
        }

        List<Map<String, Object>> result = new ArrayList<>();
        for (Map.Entry<String, Map<String, Long>> entry : grouped.entrySet()) {
            Map<String, Object> item = new HashMap<>();
            item.put("date", entry.getKey());
            item.put("earned", entry.getValue().getOrDefault("EARN", 0L));
            item.put("redeemed", entry.getValue().getOrDefault("REDEEM", 0L));
            item.put("expired", entry.getValue().getOrDefault("EXPIRED", 0L));
            result.add(item);
        }

        return result;
    }
}
