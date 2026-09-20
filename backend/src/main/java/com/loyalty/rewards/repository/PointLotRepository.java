package com.loyalty.rewards.repository;

import com.loyalty.rewards.model.PointLot;
import com.loyalty.rewards.model.PointLotStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PointLotRepository extends JpaRepository<PointLot, Long> {

    List<PointLot> findByCustomerId(Long customerId);

    List<PointLot> findByCustomerIdAndStatusInOrderByEarnedDateAsc(Long customerId, List<PointLotStatus> statuses);

    @Query("SELECT p FROM PointLot p WHERE p.status IN ('ACTIVE', 'PARTIALLY_USED') AND p.expiryDate <= :now")
    List<PointLot> findExpiredLots(@Param("now") LocalDateTime now);

    @Query("SELECT p FROM PointLot p WHERE p.status IN ('ACTIVE', 'PARTIALLY_USED') AND p.expiryDate > :now AND p.expiryDate <= :warningThreshold ORDER BY p.expiryDate ASC")
    List<PointLot> findUpcomingExpiringLots(@Param("now") LocalDateTime now, @Param("warningThreshold") LocalDateTime warningThreshold);

    @Query("SELECT p FROM PointLot p WHERE p.customerId = :customerId AND p.status IN ('ACTIVE', 'PARTIALLY_USED') AND p.expiryDate > :now AND p.expiryDate <= :warningThreshold ORDER BY p.expiryDate ASC")
    List<PointLot> findUpcomingExpiringLotsForCustomer(@Param("customerId") Long customerId, @Param("now") LocalDateTime now, @Param("warningThreshold") LocalDateTime warningThreshold);
}
