package com.loyalty.rewards.service;

import com.loyalty.rewards.model.*;
import com.loyalty.rewards.repository.FraudRepository;
import com.loyalty.rewards.repository.MemberRepository;
import com.loyalty.rewards.repository.TransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class FraudService {

    @Autowired
    private FraudRepository fraudRepository;

    @Autowired
    private MemberRepository memberRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    public List<Fraud> getAllFraudRecords() {
        return fraudRepository.findAll();
    }

    public Fraud getFraudById(Long id) {
        return fraudRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Fraud record not found with ID: " + id));
    }

    @Transactional
    public Fraud evaluateTransaction(Transaction tx, Member customer, Member performer) {
        if (tx == null || customer == null) return null;

        Long custId = customer.getMemberId();
        String custName = customer.getFullName();
        Long txId = tx.getTransactionId();
        Long perfId = (performer != null) ? performer.getMemberId() : tx.getPerformedByUserId();
        String perfName = (performer != null) ? performer.getFullName() : tx.getPerformedByName();
        Role perfRole = (performer != null) ? performer.getRole() : tx.getPerformedByRole();

        int score = 0;
        List<String> triggeredRules = new ArrayList<>();
        List<String> descriptions = new ArrayList<>();

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime fiveMinsAgo = now.minusMinutes(5);
        LocalDateTime tenMinsAgo = now.minusMinutes(10);
        LocalDateTime oneHourAgo = now.minusHours(1);
        LocalDateTime startOfDay = now.toLocalDate().atStartOfDay();

        List<Transaction> allTx = transactionRepository.findAll();

        // 1. UNUSUALLY_LARGE_EARNING (HIGH)
        if (tx.getTransactionType() == TransactionType.EARN && tx.getPoints() != null && tx.getPoints() >= 500) {
            score += 35;
            triggeredRules.add("UNUSUALLY_LARGE_EARNING");
            descriptions.add("Unusually large point earning of " + tx.getPoints() + " pts in a single transaction.");
        }

        // 2. RAPID_TRANSACTIONS (MEDIUM)
        long recentEarnCount = allTx.stream()
                .filter(t -> t.getMember() != null && t.getMember().getMemberId().equals(custId))
                .filter(t -> t.getTransactionType() == TransactionType.EARN)
                .filter(t -> t.getTransactionDate() != null && t.getTransactionDate().isAfter(fiveMinsAgo))
                .count();
        if (recentEarnCount >= 3) {
            score += 25;
            triggeredRules.add("RAPID_TRANSACTIONS");
            descriptions.add("Rapid earning velocity: " + recentEarnCount + " earn transactions within 5 minutes.");
        }

        // 3. HIGH_DAILY_EARNING (HIGH)
        int dailyEarnSum = allTx.stream()
                .filter(t -> t.getMember() != null && t.getMember().getMemberId().equals(custId))
                .filter(t -> t.getTransactionType() == TransactionType.EARN)
                .filter(t -> t.getTransactionDate() != null && t.getTransactionDate().isAfter(startOfDay))
                .mapToInt(t -> t.getPoints() != null ? t.getPoints() : 0)
                .sum();
        if (dailyEarnSum > 1500) {
            score += 35;
            triggeredRules.add("HIGH_DAILY_EARNING");
            descriptions.add("High daily accumulation: " + dailyEarnSum + " total points earned today.");
        }

        // 4. REPEATED_EARN_DEDUCT (MEDIUM)
        boolean recentDeductOrEarn = allTx.stream()
                .filter(t -> t.getMember() != null && t.getMember().getMemberId().equals(custId))
                .filter(t -> t.getTransactionDate() != null && t.getTransactionDate().isAfter(tenMinsAgo))
                .anyMatch(t -> t.getTransactionType() == TransactionType.DEDUCT || t.getTransactionType() == TransactionType.EARN);
        if (tx.getTransactionType() == TransactionType.DEDUCT && recentDeductOrEarn) {
            score += 20;
            triggeredRules.add("REPEATED_EARN_DEDUCT");
            descriptions.add("Suspicious repeated earn and deduction pattern detected within 10 minutes.");
        }

        // 5. UNUSUAL_REDEMPTION (MEDIUM)
        if (tx.getTransactionType() == TransactionType.REDEEM && tx.getPoints() != null && tx.getPoints() >= 2000) {
            score += 25;
            triggeredRules.add("UNUSUAL_REDEMPTION");
            descriptions.add("Unusually large reward redemption of " + tx.getPoints() + " pts.");
        }

        // 6. STAFF_ACTIVITY_ANOMALY (HIGH)
        if (perfId != null) {
            int staffHourlySum = allTx.stream()
                    .filter(t -> perfId.equals(t.getPerformedByUserId()))
                    .filter(t -> t.getTransactionType() == TransactionType.EARN)
                    .filter(t -> t.getTransactionDate() != null && t.getTransactionDate().isAfter(oneHourAgo))
                    .mapToInt(t -> t.getPoints() != null ? t.getPoints() : 0)
                    .sum();
            if (staffHourlySum >= 5000) {
                score += 40;
                triggeredRules.add("STAFF_ACTIVITY_ANOMALY");
                descriptions.add("Staff issuing volume anomaly: " + staffHourlySum + " pts issued by staff in 1 hour.");
            }

            // 7. MULTIPLE_CUSTOMER_ACTIVITY (MEDIUM)
            long distinctCustomers = allTx.stream()
                    .filter(t -> perfId.equals(t.getPerformedByUserId()))
                    .filter(t -> t.getTransactionDate() != null && t.getTransactionDate().isAfter(tenMinsAgo))
                    .map(t -> t.getMember() != null ? t.getMember().getMemberId() : null)
                    .filter(Objects::nonNull)
                    .distinct()
                    .count();
            if (distinctCustomers >= 5) {
                score += 25;
                triggeredRules.add("MULTIPLE_CUSTOMER_ACTIVITY");
                descriptions.add("Staff account handled " + distinctCustomers + " distinct customer accounts within 10 minutes.");
            }
        }

        if (score > 0) {
            String rulesStr = String.join(", ", triggeredRules);
            String descStr = String.join(" | ", descriptions);

            Fraud fraud = new Fraud(
                    custId, custName, txId,
                    perfId, perfName, perfRole,
                    score, rulesStr, descStr
            );
            return fraudRepository.save(fraud);
        }

        return null;
    }

    @Transactional
    public Fraud updateStatus(Long fraudId, String newStatus, String reviewerName) {
        Fraud fraud = getFraudById(fraudId);
        fraud.setStatus(newStatus.toUpperCase().trim());
        fraud.setReviewedBy(reviewerName);
        fraud.setReviewedAt(LocalDateTime.now());

        if ("BLOCKED".equalsIgnoreCase(newStatus)) {
            if (fraud.getCustomerId() != null) {
                Member member = memberRepository.findById(fraud.getCustomerId()).orElse(null);
                if (member != null) {
                    member.setStatus(Status.INACTIVE);
                    memberRepository.save(member);
                }
            }
        }

        return fraudRepository.save(fraud);
    }
}
