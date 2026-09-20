package com.loyalty.rewards.repository;

import com.loyalty.rewards.model.Partner;
import com.loyalty.rewards.model.Status;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PartnerRepository extends JpaRepository<Partner, Long> {
    List<Partner> findByNameContainingIgnoreCase(String name);
    List<Partner> findByCategory(String category);
    List<Partner> findByStatus(Status status);
}
