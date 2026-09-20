package com.loyalty.rewards.repository;

import com.loyalty.rewards.model.ExportAudit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ExportAuditRepository extends JpaRepository<ExportAudit, Long> {
}
