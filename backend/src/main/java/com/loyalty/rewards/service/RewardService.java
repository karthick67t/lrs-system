package com.loyalty.rewards.service;

import com.loyalty.rewards.model.*;
import com.loyalty.rewards.repository.MemberRepository;
import com.loyalty.rewards.repository.RewardRepository;
import com.loyalty.rewards.repository.TransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class RewardService {

    @Autowired
    private RewardRepository rewardRepository;

    @Autowired
    private MemberRepository memberRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    public List<Reward> getAllRewards() {
        return rewardRepository.findAll();
    }

    public Reward getRewardById(Long id) {
        return rewardRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Reward not found with ID: " + id));
    }

    public Reward createReward(Reward reward) {
        if (reward.getName() == null || reward.getName().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Reward name is required");
        }
        if (reward.getPointsRequired() == null || reward.getPointsRequired() <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Points required must be greater than zero");
        }
        return rewardRepository.save(reward);
    }

    public Reward updateReward(Long id, Reward rewardDetails) {
        Reward reward = getRewardById(id);
        if (rewardDetails.getName() != null) reward.setName(rewardDetails.getName());
        if (rewardDetails.getDescription() != null) reward.setDescription(rewardDetails.getDescription());
        if (rewardDetails.getPointsRequired() != null) reward.setPointsRequired(rewardDetails.getPointsRequired());
        if (rewardDetails.getStock() != null) reward.setStock(rewardDetails.getStock());
        if (rewardDetails.getCategory() != null) reward.setCategory(rewardDetails.getCategory());
        if (rewardDetails.getStatus() != null) reward.setStatus(rewardDetails.getStatus());
        return rewardRepository.save(reward);
    }

    public void deleteReward(Long id) {
        Reward reward = getRewardById(id);
        rewardRepository.delete(reward);
    }

    public List<Reward> searchByName(String name) {
        return rewardRepository.findByNameContainingIgnoreCase(name);
    }

    public List<Reward> getByCategory(String category) {
        return rewardRepository.findByCategory(category);
    }

    public List<Reward> getByStatus(Status status) {
        return rewardRepository.findByStatus(status);
    }

    public List<Reward> getAffordableRewards(Long memberId) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Member not found with ID: " + memberId));
        return rewardRepository.findByPointsRequiredLessThanEqualAndStockGreaterThan(member.getPoints(), 0);
    }

    @Autowired
    private PointsExpiryService pointsExpiryService;

    @Autowired
    private FraudService fraudService;

    @Transactional
    public Transaction redeemReward(Long rewardId, Long memberId, Member performer) {
        Reward reward = getRewardById(rewardId);
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Member not found with ID: " + memberId));

        if (reward.getStatus() != Status.ACTIVE) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Reward is currently inactive");
        }

        if (reward.getStock() <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Reward is out of stock");
        }

        if (member.getPoints() < reward.getPointsRequired()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                "Insufficient member points. Required: " + reward.getPointsRequired() + ", Available: " + member.getPoints());
        }

        int previousBalance = member.getPoints();
        int newBalance = previousBalance - reward.getPointsRequired();

        // Deduct points from member
        member.setPoints(newBalance);
        member.recalculateTier();
        memberRepository.save(member);

        // Deduct stock from reward
        reward.setStock(reward.getStock() - 1);
        rewardRepository.save(reward);

        Long perfId = (performer != null) ? performer.getMemberId() : member.getMemberId();
        String perfName = (performer != null) ? performer.getFullName() : member.getFullName();
        Role perfRole = (performer != null) ? performer.getRole() : member.getRole();

        // Record REDEEM transaction with audit fields
        Transaction tx = new Transaction(
            member, reward.getPointsRequired(), previousBalance, newBalance,
            TransactionType.REDEEM, "Redeemed Reward: " + reward.getName(),
            perfId, perfName, perfRole
        );
        Transaction savedTx = transactionRepository.save(tx);

        // Consume FIFO point lots & run real-time fraud evaluation
        pointsExpiryService.consumePoints(member.getMemberId(), reward.getPointsRequired());
        fraudService.evaluateTransaction(savedTx, member, performer);

        return savedTx;
    }
}
