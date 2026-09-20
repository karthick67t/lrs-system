package com.loyalty.rewards.service;

import com.loyalty.rewards.dto.FeedbackRequest;
import com.loyalty.rewards.model.*;
import com.loyalty.rewards.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class FeedbackService {

    @Autowired
    private FeedbackRepository feedbackRepository;

    @Autowired
    private MemberRepository memberRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private RewardRepository rewardRepository;

    @Autowired
    private PartnerRepository partnerRepository;

    @Autowired
    private MemberService memberService;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private FraudRepository fraudRepository;

    private static final Set<String> POSITIVE_KEYWORDS = new HashSet<>(Arrays.asList(
        "excellent", "good", "great", "amazing", "happy", "love", "useful", "fast", "easy", "best",
        "awesome", "superb", "wonderful", "perfect", "recommend", "liked", "smooth", "prompt", "top"
    ));

    private static final Set<String> NEGATIVE_KEYWORDS = new HashSet<>(Arrays.asList(
        "bad", "poor", "terrible", "slow", "worst", "problem", "issue", "hate", "disappointed", "useless",
        "horrible", "delay", "fail", "defect", "flaw", "broken", "unhappy", "waste", "fraud", "error"
    ));

    public Sentiment analyzeSentiment(Integer rating, String comment) {
        int score = 0;

        if (rating != null) {
            if (rating >= 4) score += (rating == 5 ? 2 : 1);
            else if (rating <= 2) score -= (rating == 1 ? 2 : 1);
        }

        if (comment != null && !comment.isBlank()) {
            String text = comment.toLowerCase().replaceAll("[^a-z0-9\\s]", " ");
            String[] words = text.split("\\s+");
            for (String word : words) {
                if (POSITIVE_KEYWORDS.contains(word)) score += 1;
                if (NEGATIVE_KEYWORDS.contains(word)) score -= 1;
            }
        }

        if (score > 0) return Sentiment.POSITIVE;
        if (score < 0) return Sentiment.NEGATIVE;
        return Sentiment.NEUTRAL;
    }

    @Transactional
    public Feedback submitFeedback(FeedbackRequest request, Member authenticatedCustomer) {
        if (authenticatedCustomer == null || authenticatedCustomer.getRole() != Role.CUSTOMER) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only CUSTOMER role accounts can submit feedback.");
        }

        if (request == null || request.getRating() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Rating is required.");
        }

        if (request.getRating() < 1 || request.getRating() > 5) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Rating must be between 1 and 5 stars.");
        }

        String comment = request.getComment() != null ? request.getComment().trim() : "";
        if (comment.length() > 2000) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Comment cannot exceed 2000 characters.");
        }

        Long customerId = authenticatedCustomer.getMemberId();
        FeedbackType type = request.getFeedbackType() != null ? request.getFeedbackType() : FeedbackType.GENERAL;

        String rewardName = null;
        String partnerName = null;

        // Verification & Anti-Duplicate logic
        if (type == FeedbackType.REWARD) {
            if (request.getRewardId() == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Reward ID is required for REWARD feedback.");
            }
            Reward reward = rewardRepository.findById(request.getRewardId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Reward not found."));
            rewardName = reward.getName();

            // Verify customer redeemed this reward or has transaction
            boolean redeemed = transactionRepository.findAll().stream()
                .anyMatch(t -> t.getMember() != null && t.getMember().getMemberId().equals(customerId) &&
                               t.getTransactionType() == TransactionType.REDEEM &&
                               t.getDescription() != null && t.getDescription().toLowerCase().contains(reward.getName().toLowerCase()));
            
            if (!redeemed) {
                // Check general customer transaction history or fallback
                boolean hasRedemptions = transactionRepository.findAll().stream()
                    .anyMatch(t -> t.getMember() != null && t.getMember().getMemberId().equals(customerId) && t.getTransactionType() == TransactionType.REDEEM);
                if (!hasRedemptions) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Feedback can only be submitted for rewards you have actually redeemed.");
                }
            }

            // Check duplicate
            if (feedbackRepository.findByCustomerIdAndRewardId(customerId, request.getRewardId()).isPresent()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "You have already submitted feedback for this reward.");
            }
        } else if (type == FeedbackType.TRANSACTION) {
            if (request.getTransactionId() == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Transaction ID is required for TRANSACTION feedback.");
            }
            Transaction tx = transactionRepository.findById(request.getTransactionId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Transaction not found."));

            if (tx.getMember() == null || !tx.getMember().getMemberId().equals(customerId)) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only submit feedback for your own transactions.");
            }

            // Check duplicate
            if (feedbackRepository.findByCustomerIdAndTransactionId(customerId, request.getTransactionId()).isPresent()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "You have already submitted feedback for this transaction.");
            }
        } else if (type == FeedbackType.PARTNER) {
            if (request.getPartnerId() != null) {
                Partner partner = partnerRepository.findById(request.getPartnerId()).orElse(null);
                if (partner != null) {
                    partnerName = partner.getName();
                }
            }
        }

        // Fraud Rate-Limiting Check: Excessive feedback entries (e.g. > 5 in last hour)
        LocalDateTime oneHourAgo = LocalDateTime.now().minusHours(1);
        long recentSubmissions = feedbackRepository.findByCustomerId(customerId).stream()
            .filter(f -> f.getCreatedAt() != null && f.getCreatedAt().isAfter(oneHourAgo))
            .count();

        if (recentSubmissions >= 10) {
            // Trigger Fraud Log for excessive feedback points farming attempt
            Fraud fraudAlert = new Fraud(
                customerId, authenticatedCustomer.getFullName(), request.getTransactionId(),
                null, "System Anti-Abuse", Role.SUPER_ADMIN,
                50, "EXCESSIVE_FEEDBACK_SUBMISSION",
                "Customer submitted " + recentSubmissions + " feedback entries in 1 hour. Possible bonus points farming attempt."
            );
            fraudRepository.save(fraudAlert);
            throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS, "Excessive feedback rate limit reached. Please wait before submitting more feedback.");
        }

        Sentiment sentiment = analyzeSentiment(request.getRating(), comment);

        Feedback feedback = new Feedback(
            customerId, authenticatedCustomer.getFullName(), request.getRating(), comment,
            type, request.getRewardId(), rewardName, request.getPartnerId(), partnerName,
            request.getTransactionId(), sentiment
        );

        Feedback savedFeedback = feedbackRepository.save(feedback);

        // Award 5 Bonus Loyalty Points for valid feedback submission
        memberService.earnPoints(customerId, 5, "Bonus points for verified customer feedback", null);

        // Send System Notification to Customer
        try {
            Notification notif = new Notification(
                authenticatedCustomer,
                "Feedback Received (+5 Bonus Points)",
                "Thank you for sharing your loyalty feedback! 5 bonus points have been credited to your account balance.",
                "SYSTEM"
            );
            notificationRepository.save(notif);
        } catch (Exception e) {
            // Ignore non-critical notification error
        }

        return savedFeedback;
    }

    public List<Feedback> getMyFeedback(Member authenticatedCustomer) {
        if (authenticatedCustomer == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthenticated");
        }
        return feedbackRepository.findByCustomerId(authenticatedCustomer.getMemberId());
    }

    public Feedback getMyFeedbackById(Long id, Member authenticatedCustomer) {
        Feedback fb = feedbackRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Feedback not found with ID: " + id));

        if (authenticatedCustomer != null && authenticatedCustomer.getRole() == Role.CUSTOMER) {
            if (!fb.getCustomerId().equals(authenticatedCustomer.getMemberId())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Customers can only view their own feedback.");
            }
        }
        return fb;
    }

    public List<Feedback> getAllFeedback() {
        return feedbackRepository.findAll();
    }

    public Feedback getFeedbackById(Long id) {
        return feedbackRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Feedback record not found with ID: " + id));
    }

    public List<Feedback> getByRating(Integer rating) {
        return feedbackRepository.findByRating(rating);
    }

    public List<Feedback> getBySentiment(Sentiment sentiment) {
        return feedbackRepository.findBySentiment(sentiment);
    }

    public List<Feedback> getByType(FeedbackType type) {
        return feedbackRepository.findByFeedbackType(type);
    }

    public List<Feedback> getByStatus(FeedbackStatus status) {
        return feedbackRepository.findByStatus(status);
    }

    @Transactional
    public Feedback updateStatus(Long id, String statusStr, Member reviewer) {
        Feedback fb = getFeedbackById(id);
        FeedbackStatus newStatus;
        try {
            newStatus = FeedbackStatus.valueOf(statusStr.trim().toUpperCase());
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid feedback status: " + statusStr);
        }

        fb.setStatus(newStatus);
        fb.setReviewedBy(reviewer != null ? reviewer.getFullName() : "System Admin");
        fb.setReviewedAt(LocalDateTime.now());

        Feedback updated = feedbackRepository.save(fb);

        if (newStatus == FeedbackStatus.RESOLVED) {
            try {
                Member cust = memberRepository.findById(fb.getCustomerId()).orElse(null);
                if (cust != null) {
                    Notification notif = new Notification(
                        cust,
                        "Feedback Reviewed & Resolved",
                        "Your feedback #" + fb.getFeedbackId() + " has been reviewed and marked as resolved by management. Thank you for helping improve LRS!",
                        "SYSTEM"
                    );
                    notificationRepository.save(notif);
                }
            } catch (Exception ignored) {}
        }

        return updated;
    }

    public Map<String, Object> getAnalytics() {
        List<Feedback> all = feedbackRepository.findAll();
        long totalFeedback = all.size();

        double avgRating = totalFeedback > 0
            ? Math.round(all.stream().mapToInt(f -> f.getRating() != null ? f.getRating() : 0).average().orElse(0.0) * 10.0) / 10.0
            : 0.0;

        long positiveCount = all.stream().filter(f -> f.getSentiment() == Sentiment.POSITIVE).count();
        long neutralCount = all.stream().filter(f -> f.getSentiment() == Sentiment.NEUTRAL).count();
        long negativeCount = all.stream().filter(f -> f.getSentiment() == Sentiment.NEGATIVE).count();

        double positivePct = totalFeedback > 0 ? Math.round(((double) positiveCount / totalFeedback) * 1000.0) / 10.0 : 0.0;
        double neutralPct = totalFeedback > 0 ? Math.round(((double) neutralCount / totalFeedback) * 1000.0) / 10.0 : 0.0;
        double negativePct = totalFeedback > 0 ? Math.round(((double) negativeCount / totalFeedback) * 1000.0) / 10.0 : 0.0;

        long pendingReview = all.stream().filter(f -> f.getStatus() == FeedbackStatus.ACTIVE).count();
        long bonusPointsIssued = totalFeedback * 5;

        // Rating distribution 1..5
        Map<Integer, Long> ratingDist = new LinkedHashMap<>();
        for (int r = 1; r <= 5; r++) {
            final int star = r;
            ratingDist.put(star, all.stream().filter(f -> f.getRating() != null && f.getRating() == star).count());
        }

        Map<String, Object> res = new HashMap<>();
        res.put("totalFeedback", totalFeedback);
        res.put("avgRating", avgRating);
        res.put("positiveCount", positiveCount);
        res.put("neutralCount", neutralCount);
        res.put("negativeCount", negativeCount);
        res.put("positivePercentage", positivePct);
        res.put("neutralPercentage", neutralPct);
        res.put("negativePercentage", negativePct);
        res.put("pendingReview", pendingReview);
        res.put("bonusPointsIssued", bonusPointsIssued);
        res.put("ratingDistribution", ratingDist);

        return res;
    }
}
