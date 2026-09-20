package com.loyalty.rewards.repository;

import com.loyalty.rewards.model.Finance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FinanceRepository extends JpaRepository<Finance, Long> {
    List<Finance> findByDescriptionContainingIgnoreCase(String description);
    List<Finance> findByType(String type);
    List<Finance> findByStatus(String status);
}
