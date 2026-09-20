package com.loyalty.rewards.repository;

import com.loyalty.rewards.model.Challenge;
import com.loyalty.rewards.model.Status;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChallengeRepository extends JpaRepository<Challenge, Long> {
    List<Challenge> findByNameContainingIgnoreCase(String name);
    List<Challenge> findByCategory(String category);
    List<Challenge> findByStatus(Status status);
}
