package com.loyalty.rewards.repository;

import com.loyalty.rewards.model.Complaint;
import com.loyalty.rewards.model.ComplaintStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ComplaintRepository extends JpaRepository<Complaint, Long> {
    List<Complaint> findByStatus(ComplaintStatus status);
    List<Complaint> findAllByOrderByCreatedAtDesc();
}
