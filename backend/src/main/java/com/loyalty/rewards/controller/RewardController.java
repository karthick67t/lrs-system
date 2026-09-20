package com.loyalty.rewards.controller;

import com.loyalty.rewards.dto.RedeemRequest;
import com.loyalty.rewards.model.Member;
import com.loyalty.rewards.model.Role;
import com.loyalty.rewards.model.Reward;
import com.loyalty.rewards.model.Status;
import com.loyalty.rewards.model.Transaction;
import com.loyalty.rewards.service.RewardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/rewards")
@CrossOrigin
public class RewardController {

    @Autowired
    private RewardService rewardService;

    private Member getAuthenticatedMember(Authentication authentication) {
        if (authentication != null && authentication.getPrincipal() instanceof Member) {
            return (Member) authentication.getPrincipal();
        }
        return null;
    }

    @GetMapping
    public ResponseEntity<List<Reward>> getAllRewards() {
        return ResponseEntity.ok(rewardService.getAllRewards());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Reward> getRewardById(@PathVariable Long id) {
        return ResponseEntity.ok(rewardService.getRewardById(id));
    }

    @PostMapping
    public ResponseEntity<Reward> createReward(@RequestBody Reward reward, Authentication authentication) {
        Member current = getAuthenticatedMember(authentication);
        if (current != null && current.getRole() == Role.CUSTOMER) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Customers cannot create rewards.");
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(rewardService.createReward(reward));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Reward> updateReward(@PathVariable Long id, @RequestBody Reward rewardDetails, Authentication authentication) {
        Member current = getAuthenticatedMember(authentication);
        if (current != null && current.getRole() == Role.CUSTOMER) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Customers cannot edit rewards.");
        }
        return ResponseEntity.ok(rewardService.updateReward(id, rewardDetails));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReward(@PathVariable Long id, Authentication authentication) {
        Member current = getAuthenticatedMember(authentication);
        if (current != null && current.getRole() == Role.CUSTOMER) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Customers cannot delete rewards.");
        }
        rewardService.deleteReward(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/search")
    public ResponseEntity<List<Reward>> searchByName(@RequestParam(name = "name", required = false) String name) {
        if (name == null || name.isBlank()) {
            return ResponseEntity.ok(rewardService.getAllRewards());
        }
        return ResponseEntity.ok(rewardService.searchByName(name));
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<List<Reward>> getByCategory(@PathVariable String category) {
        return ResponseEntity.ok(rewardService.getByCategory(category));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<Reward>> getByStatus(@PathVariable Status status) {
        return ResponseEntity.ok(rewardService.getByStatus(status));
    }

    @GetMapping("/affordable/{memberId}")
    public ResponseEntity<List<Reward>> getAffordableRewards(@PathVariable Long memberId) {
        return ResponseEntity.ok(rewardService.getAffordableRewards(memberId));
    }

    @PostMapping("/{rewardId}/redeem/{memberId}")
    public ResponseEntity<Transaction> redeemReward(
            @PathVariable Long rewardId,
            @PathVariable Long memberId,
            Authentication authentication) {
        Member current = getAuthenticatedMember(authentication);
        if (current != null && current.getRole() == Role.CUSTOMER && !current.getMemberId().equals(memberId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Customers can only redeem rewards for themselves.");
        }
        return ResponseEntity.ok(rewardService.redeemReward(rewardId, memberId, current));
    }

    @PostMapping("/redeem")
    public ResponseEntity<Transaction> redeemRewardBody(@RequestBody RedeemRequest request, Authentication authentication) {
        Member current = getAuthenticatedMember(authentication);
        if (current != null && current.getRole() == Role.CUSTOMER && !current.getMemberId().equals(request.getMemberId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Customers can only redeem rewards for themselves.");
        }
        return ResponseEntity.ok(rewardService.redeemReward(request.getRewardId(), request.getMemberId(), current));
    }
}
