package com.loyalty.rewards.repository;

import com.loyalty.rewards.model.Feedback;
import com.loyalty.rewards.model.FeedbackStatus;
import com.loyalty.rewards.model.FeedbackType;
import com.loyalty.rewards.model.Sentiment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, Long> {
    List<Feedback> findByCustomerId(Long customerId);
    Optional<Feedback> findByCustomerIdAndTransactionId(Long customerId, Long transactionId);
    Optional<Feedback> findByCustomerIdAndRewardId(Long customerId, Long rewardId);
    List<Feedback> findByRating(Integer rating);
    List<Feedback> findBySentiment(Sentiment sentiment);
    List<Feedback> findByFeedbackType(FeedbackType feedbackType);
    List<Feedback> findByStatus(FeedbackStatus status);
}
