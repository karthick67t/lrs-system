package com.loyalty.rewards.repository;

import com.loyalty.rewards.model.Transaction;
import com.loyalty.rewards.model.TransactionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long>, JpaSpecificationExecutor<Transaction> {
    List<Transaction> findByMemberMemberIdOrderByTransactionDateDesc(Long memberId);
    List<Transaction> findByTransactionTypeOrderByTransactionDateDesc(TransactionType transactionType);
    List<Transaction> findAllByOrderByTransactionDateDesc();
}
