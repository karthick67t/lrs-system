package com.loyalty.rewards.service;

import com.loyalty.rewards.model.Transaction;
import com.loyalty.rewards.model.TransactionType;
import com.loyalty.rewards.repository.TransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class TransactionService {

    @Autowired
    private TransactionRepository transactionRepository;

    public List<Transaction> getAllTransactions() {
        return transactionRepository.findAllByOrderByTransactionDateDesc();
    }

    public Transaction getTransactionById(Long id) {
        return transactionRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Transaction not found with ID: " + id));
    }

    public List<Transaction> getTransactionsByMemberId(Long memberId) {
        return transactionRepository.findByMemberMemberIdOrderByTransactionDateDesc(memberId);
    }

    public List<Transaction> getTransactionsByType(TransactionType type) {
        return transactionRepository.findByTransactionTypeOrderByTransactionDateDesc(type);
    }
}
