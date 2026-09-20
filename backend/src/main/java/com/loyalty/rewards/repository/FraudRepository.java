package com.loyalty.rewards.repository;

import com.loyalty.rewards.model.Fraud;
import com.loyalty.rewards.model.RiskLevel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FraudRepository extends JpaRepository<Fraud, Long> {
    List<Fraud> findByCustomerNameContainingIgnoreCase(String name);
    List<Fraud> findByCustomerId(Long customerId);
    List<Fraud> findByRiskLevel(RiskLevel riskLevel);
    List<Fraud> findByStatus(String status);
}
