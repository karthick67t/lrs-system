package com.loyalty.rewards.repository;

import com.loyalty.rewards.model.Role;
import com.loyalty.rewards.model.Transaction;
import com.loyalty.rewards.model.TransactionType;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

public class TransactionSpecification {

    public static Specification<Transaction> filterTransactions(
            Long customerId,
            String customerName,
            Long performedBy,
            Role performedByRole,
            TransactionType transactionType,
            LocalDate startDate,
            LocalDate endDate,
            Integer minPoints,
            Integer maxPoints) {

        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (customerId != null) {
                predicates.add(criteriaBuilder.equal(root.get("member").get("memberId"), customerId));
            }

            if (customerName != null && !customerName.trim().isEmpty()) {
                String pattern = "%" + customerName.trim().toLowerCase() + "%";
                predicates.add(criteriaBuilder.like(criteriaBuilder.lower(root.get("member").get("fullName")), pattern));
            }

            if (performedBy != null) {
                predicates.add(criteriaBuilder.equal(root.get("performedByUserId"), performedBy));
            }

            if (performedByRole != null) {
                predicates.add(criteriaBuilder.equal(root.get("performedByRole"), performedByRole));
            }

            if (transactionType != null) {
                predicates.add(criteriaBuilder.equal(root.get("transactionType"), transactionType));
            }

            if (startDate != null) {
                LocalDateTime startDateTime = startDate.atStartOfDay();
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("transactionDate"), startDateTime));
            }

            if (endDate != null) {
                LocalDateTime endDateTime = endDate.atTime(LocalTime.MAX);
                predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get("transactionDate"), endDateTime));
            }

            if (minPoints != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("points"), minPoints));
            }

            if (maxPoints != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get("points"), maxPoints));
            }

            if (query != null) {
                query.orderBy(criteriaBuilder.desc(root.get("transactionDate")));
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
}
