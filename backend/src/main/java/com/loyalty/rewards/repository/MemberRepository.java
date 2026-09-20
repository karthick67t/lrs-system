package com.loyalty.rewards.repository;

import com.loyalty.rewards.model.Member;
import com.loyalty.rewards.model.Status;
import com.loyalty.rewards.model.Tier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MemberRepository extends JpaRepository<Member, Long> {
    Optional<Member> findByEmail(String email);
    Optional<Member> findByPhone(String phone);
    List<Member> findByFullNameContainingIgnoreCase(String fullName);
    List<Member> findByStatus(Status status);
    List<Member> findByTier(Tier tier);
}
