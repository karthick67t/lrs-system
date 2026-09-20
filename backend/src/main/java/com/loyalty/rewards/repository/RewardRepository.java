package com.loyalty.rewards.repository;

import com.loyalty.rewards.model.Reward;
import com.loyalty.rewards.model.Status;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RewardRepository extends JpaRepository<Reward, Long> {
    List<Reward> findByNameContainingIgnoreCase(String name);
    List<Reward> findByCategory(String category);
    List<Reward> findByStatus(Status status);
    List<Reward> findByPointsRequiredLessThanEqualAndStockGreaterThan(Integer pointsRequired, Integer stock);
}
