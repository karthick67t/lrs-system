package com.loyalty.rewards.service;

import com.loyalty.rewards.model.*;
import com.loyalty.rewards.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Service
public class PointsExpiryService {

    private int defaultExpiryDays = 365;
    private int warningDays = 30;

    @Autowired
    private PointLotRepository pointLotRepository;

    @Autowired
    private MemberRepository memberRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    public int getDefaultExpiryDays() {
        return defaultExpiryDays;
    }

    public void setDefaultExpiryDays(int defaultExpiryDays) {
        this.defaultExpiryDays = defaultExpiryDays;
    }

    @Transactional
    public PointLot createLot(Long customerId, Integer earnedPoints, Long sourceTransactionId) {
        if (earnedPoints == null || earnedPoints <= 0) return null;
        LocalDateTime expiry = LocalDateTime.now().plusDays(defaultExpiryDays);
        PointLot lot = new PointLot(customerId, earnedPoints, expiry, sourceTransactionId);
        return pointLotRepository.save(lot);
    }

    @Transactional
    public void consumePoints(Long customerId, Integer pointsToConsume) {
        if (pointsToConsume == null || pointsToConsume <= 0) return;

        List<PointLot> activeLots = pointLotRepository.findByCustomerIdAndStatusInOrderByEarnedDateAsc(
                customerId, Arrays.asList(PointLotStatus.ACTIVE, PointLotStatus.PARTIALLY_USED)
        );

        int remainingDeduct = pointsToConsume;
        for (PointLot lot : activeLots) {
            if (remainingDeduct <= 0) break;

            int avail = lot.getRemainingPoints();
            if (avail <= remainingDeduct) {
                remainingDeduct -= avail;
                lot.setRemainingPoints(0);
                lot.setStatus(PointLotStatus.FULLY_USED);
            } else {
                lot.setRemainingPoints(avail - remainingDeduct);
                lot.setStatus(PointLotStatus.PARTIALLY_USED);
                remainingDeduct = 0;
            }
            pointLotRepository.save(lot);
        }
    }

    @Transactional
    public Map<String, Object> processExpiries() {
        LocalDateTime now = LocalDateTime.now();
        List<PointLot> expiredLots = pointLotRepository.findExpiredLots(now);

        Map<Long, Integer> customerExpiredPoints = new HashMap<>();
        Map<Long, List<PointLot>> customerLotsMap = new HashMap<>();

        for (PointLot lot : expiredLots) {
            Long custId = lot.getCustomerId();
            int pointsToExpire = lot.getRemainingPoints();
            if (pointsToExpire > 0) {
                customerExpiredPoints.put(custId, customerExpiredPoints.getOrDefault(custId, 0) + pointsToExpire);
                customerLotsMap.computeIfAbsent(custId, k -> new ArrayList<>()).add(lot);
            }
        }

        int totalPointsExpired = 0;
        int totalCustomersAffected = customerExpiredPoints.size();

        for (Map.Entry<Long, Integer> entry : customerExpiredPoints.entrySet()) {
            Long custId = entry.getKey();
            int expiredPts = entry.getValue();
            totalPointsExpired += expiredPts;

            Member customer = memberRepository.findById(custId).orElse(null);
            if (customer != null) {
                int prevBal = customer.getPoints();
                int newBal = Math.max(0, prevBal - expiredPts);
                int actualDeducted = prevBal - newBal;

                customer.setPoints(newBal);
                customer.recalculateTier();
                memberRepository.save(customer);

                // Create immutable EXPIRED Transaction history record
                Transaction tx = new Transaction(
                        customer, null, actualDeducted, prevBal, newBal,
                        TransactionType.EXPIRED, "Expired " + actualDeducted + " loyalty points (Lot Expiry)",
                        null, "System Expiry Engine", Role.SUPER_ADMIN
                );
                transactionRepository.save(tx);

                // Create expiry notification
                Notification notif = new Notification(
                        customer,
                        "Loyalty Points Expired",
                        "Your " + actualDeducted + " loyalty points have expired.",
                        "EXPIRY"
                );
                notificationRepository.save(notif);
            }

            // Mark lots as EXPIRED
            List<PointLot> lots = customerLotsMap.get(custId);
            if (lots != null) {
                for (PointLot lot : lots) {
                    lot.setRemainingPoints(0);
                    lot.setStatus(PointLotStatus.EXPIRED);
                    pointLotRepository.save(lot);
                }
            }
        }

        Map<String, Object> result = new HashMap<>();
        result.put("totalPointsExpired", totalPointsExpired);
        result.put("totalCustomersAffected", totalCustomersAffected);
        result.put("expiredLotsProcessed", expiredLots.size());
        result.put("timestamp", LocalDateTime.now());
        return result;
    }

    public List<Map<String, Object>> getUpcomingExpiriesCustomer(Long customerId) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime warningThreshold = now.plusDays(warningDays);
        List<PointLot> lots = pointLotRepository.findUpcomingExpiringLotsForCustomer(customerId, now, warningThreshold);

        Member customer = memberRepository.findById(customerId).orElse(null);
        String customerName = (customer != null) ? customer.getFullName() : "Customer #" + customerId;

        List<Map<String, Object>> list = new ArrayList<>();
        for (PointLot lot : lots) {
            long daysRemaining = ChronoUnit.DAYS.between(now, lot.getExpiryDate());
            Map<String, Object> item = new HashMap<>();
            item.put("lotId", lot.getId());
            item.put("customerId", customerId);
            item.put("customerName", customerName);
            item.put("earnedPoints", lot.getEarnedPoints());
            item.put("remainingPoints", lot.getRemainingPoints());
            item.put("earnedDate", lot.getEarnedDate());
            item.put("expiryDate", lot.getExpiryDate());
            item.put("daysRemaining", Math.max(0, daysRemaining));
            item.put("status", lot.getStatus().name());
            list.add(item);
        }
        return list;
    }

    public List<Map<String, Object>> getUpcomingExpiriesGlobal() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime warningThreshold = now.plusDays(warningDays);
        List<PointLot> lots = pointLotRepository.findUpcomingExpiringLots(now, warningThreshold);

        Map<Long, Member> memberMap = new HashMap<>();
        List<Map<String, Object>> list = new ArrayList<>();
        for (PointLot lot : lots) {
            Member m = memberMap.computeIfAbsent(lot.getCustomerId(), id -> memberRepository.findById(id).orElse(null));
            String name = (m != null) ? m.getFullName() : "Customer #" + lot.getCustomerId();

            long daysRemaining = ChronoUnit.DAYS.between(now, lot.getExpiryDate());
            Map<String, Object> item = new HashMap<>();
            item.put("lotId", lot.getId());
            item.put("customerId", lot.getCustomerId());
            item.put("customerName", name);
            item.put("earnedPoints", lot.getEarnedPoints());
            item.put("remainingPoints", lot.getRemainingPoints());
            item.put("earnedDate", lot.getEarnedDate());
            item.put("expiryDate", lot.getExpiryDate());
            item.put("daysRemaining", Math.max(0, daysRemaining));
            item.put("status", lot.getStatus().name());
            list.add(item);
        }
        return list;
    }

    public List<PointLot> getCustomerLots(Long customerId) {
        return pointLotRepository.findByCustomerId(customerId);
    }
}
