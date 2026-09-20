package com.loyalty.rewards.config;

import com.loyalty.rewards.model.*;
import com.loyalty.rewards.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private MemberRepository memberRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private RewardRepository rewardRepository;

    @Autowired
    private ChallengeRepository challengeRepository;

    @Autowired
    private PartnerRepository partnerRepository;

    @Autowired
    private FraudRepository fraudRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private FinanceRepository financeRepository;

    @Autowired
    private org.springframework.jdbc.core.JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) throws Exception {
        try {
            jdbcTemplate.execute("ALTER TABLE fraud_alerts ADD COLUMN IF NOT EXISTS customer_id BIGINT;");
            jdbcTemplate.execute("ALTER TABLE fraud_alerts ADD COLUMN IF NOT EXISTS customer_name VARCHAR(255);");
            jdbcTemplate.execute("ALTER TABLE fraud_alerts ADD COLUMN IF NOT EXISTS transaction_id BIGINT;");
            jdbcTemplate.execute("ALTER TABLE fraud_alerts ADD COLUMN IF NOT EXISTS performed_by_user_id BIGINT;");
            jdbcTemplate.execute("ALTER TABLE fraud_alerts ADD COLUMN IF NOT EXISTS performed_by_name VARCHAR(255);");
            jdbcTemplate.execute("ALTER TABLE fraud_alerts ADD COLUMN IF NOT EXISTS performed_by_role VARCHAR(255);");
            jdbcTemplate.execute("ALTER TABLE fraud_alerts ADD COLUMN IF NOT EXISTS detected_rules VARCHAR(255);");
            jdbcTemplate.execute("ALTER TABLE fraud_alerts ADD COLUMN IF NOT EXISTS detected_at TIMESTAMP;");
            jdbcTemplate.execute("ALTER TABLE fraud_alerts ADD COLUMN IF NOT EXISTS reviewed_by VARCHAR(255);");
            jdbcTemplate.execute("ALTER TABLE fraud_alerts ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP;");
            jdbcTemplate.execute("ALTER TABLE fraud_alerts ALTER COLUMN member_id DROP NOT NULL;");
            jdbcTemplate.execute("UPDATE fraud_alerts SET detected_at = NOW() WHERE detected_at IS NULL;");
            jdbcTemplate.execute("UPDATE fraud_alerts SET status = 'OPEN' WHERE status IS NULL;");
        } catch (Exception e) {
            // Ignore if column already exists or table freshly created
        }

        if (memberRepository.findByEmail("customer@loyalty.com").isEmpty()) {
            System.out.println(">>> Seeding Customer Account for Loyalty Rewards System...");
            memberRepository.save(new Member(
                "Demo Loyalty Customer", "customer@loyalty.com", "+1 800-555-0100", "customer123", 1850, Status.ACTIVE, Tier.SILVER, Role.CUSTOMER
            ));
        }

        if (memberRepository.count() <= 1) {
            System.out.println(">>> Seeding Initial Database Data for Loyalty Rewards System...");

            // Seed Demo Users
            Member admin = memberRepository.save(new Member(
                "Super Admin User", "admin@loyalty.com", "+1 800-555-0199", "admin123", 10000, Status.ACTIVE, Tier.PLATINUM, Role.SUPER_ADMIN
            ));

            Member manager = memberRepository.save(new Member(
                "Loyalty Operations Manager", "manager@loyalty.com", "+1 800-555-0188", "manager123", 3500, Status.ACTIVE, Tier.GOLD, Role.LOYALTY_MANAGER
            ));

            Member staff = memberRepository.save(new Member(
                "Store Staff User", "staff@loyalty.com", "+1 800-555-0177", "staff123", 1200, Status.ACTIVE, Tier.SILVER, Role.STAFF
            ));

            Member customer1 = memberRepository.save(new Member(
                "Alexander Wright", "alex.wright@example.com", "+1 555-0123", "alex123", 6200, Status.ACTIVE, Tier.PLATINUM, Role.CUSTOMER
            ));

            Member customer2 = memberRepository.save(new Member(
                "Sophia Chen", "sophia.chen@example.com", "+1 555-0144", "sophia123", 2800, Status.ACTIVE, Tier.GOLD, Role.CUSTOMER
            ));

            Member customer3 = memberRepository.save(new Member(
                "Marcus Vance", "marcus.vance@example.com", "+1 555-0166", "marcus123", 1150, Status.ACTIVE, Tier.SILVER, Role.CUSTOMER
            ));

            Member customer4 = memberRepository.save(new Member(
                "Elena Rostova", "elena.rostova@example.com", "+1 555-0188", "elena123", 450, Status.ACTIVE, Tier.BRONZE, Role.CUSTOMER
            ));

            // Seed Rewards
            Reward r1 = rewardRepository.save(new Reward("VIP Lounge Pass", "Exclusive airport VIP lounge entry pass for premium travelers", 1500, 50, "TRAVEL", Status.ACTIVE));
            Reward r2 = rewardRepository.save(new Reward("$50 Digital Gift Card", "$50 electronic gift voucher valid across all partner stores", 500, 200, "VOUCHERS", Status.ACTIVE));
            Reward r3 = rewardRepository.save(new Reward("Premium Espresso Machine", "Compact high-pressure barista coffee machine", 4500, 15, "ELECTRONICS", Status.ACTIVE));
            Reward r4 = rewardRepository.save(new Reward("Free Gourmet Dinner for 2", "Multi-course dining experience at participating 5-star partner restaurants", 3000, 30, "DINING", Status.ACTIVE));
            Reward r5 = rewardRepository.save(new Reward("Luxury Watch Discount Coupon", "25% discount coupon on luxury watch collection", 800, 100, "FASHION", Status.ACTIVE));

            // Seed Transactions with Performer Audit
            transactionRepository.save(new Transaction(customer1, 5000, 1200, 6200, TransactionType.EARN, "Annual Loyalty Renewal Bonus", admin.getMemberId(), admin.getFullName(), admin.getRole()));
            transactionRepository.save(new Transaction(customer1, 1500, 6200, 4700, TransactionType.REDEEM, "Redeemed VIP Lounge Pass", customer1.getMemberId(), customer1.getFullName(), customer1.getRole()));
            transactionRepository.save(new Transaction(customer2, 2800, 0, 2800, TransactionType.EARN, "Purchase Bonus Reward", staff.getMemberId(), staff.getFullName(), staff.getRole()));
            transactionRepository.save(new Transaction(customer3, 1150, 0, 1150, TransactionType.EARN, "Welcome Onboarding Points", staff.getMemberId(), staff.getFullName(), staff.getRole()));
            transactionRepository.save(new Transaction(customer4, 450, 0, 450, TransactionType.EARN, "First Order Reward", staff.getMemberId(), staff.getFullName(), staff.getRole()));

            // Seed Challenges
            challengeRepository.save(new Challenge("Weekend Shopping Spree", "Earn double points on all weekend purchases above $100", 500, 320, "PROMOTION", Status.ACTIVE));
            challengeRepository.save(new Challenge("Mobile App Pioneer", "Complete 5 transactions using the mobile wallet app", 100, 100, "DIGITAL", Status.ACTIVE));
            challengeRepository.save(new Challenge("Gold Tier Sprint", "Reach 2500 total points within 30 days to unlock bonus rewards", 2500, 1850, "TIER_UPGRADE", Status.ACTIVE));

            // Seed Partners
            partnerRepository.save(new Partner("AeroSky Airlines", "Global airline network with miles conversion integration", "AIRLINES", Status.ACTIVE));
            partnerRepository.save(new Partner("Grand Lux Hotels", "5-star luxury accommodation booking partner", "HOSPITALITY", Status.ACTIVE));
            partnerRepository.save(new Partner("VelociTech Electronics", "Consumer electronics & gadget retail chain", "RETAIL", Status.ACTIVE));

            // Seed Fraud Alerts
            fraudRepository.save(new Fraud(customer4, 85, "RAPID_POINT_VELOCITY", "FLAG_REVIEW", "Suspicious volume of 50 micro-transactions in under 5 minutes"));
            fraudRepository.save(new Fraud(customer3, 45, "MULTIPLE_DEVICE_LOGIN", "REVIEWED_CLEARED", "Logins detected from 3 distinct IP locations within 1 hour"));

            // Seed Notifications
            notificationRepository.save(new Notification("Double Points Weekend Alert!", "Earn 2x rewards on all partner dining transactions this Saturday & Sunday.", "PROMOTIONAL", NotificationStatus.SENT, "ALL", LocalDateTime.now().minusDays(2)));
            notificationRepository.save(new Notification("Gold Tier Upgrade Celebration", "Congratulations on reaching Gold Tier! Enjoy complimentary priority support.", "TIER_UPDATE", NotificationStatus.SCHEDULED, "GOLD", LocalDateTime.now().plusDays(1)));

            // Seed Finance Ledger
            financeRepository.save(new Finance(1L, "REVENUE", "Partner Co-Op Sponsorship Fund", 12500.00, 50000, "SETTLED", LocalDateTime.now().minusDays(5)));
            financeRepository.save(new Finance(2L, "LIABILITY", "Points Redemption Expense - VIP Pass", 150.00, 1500, "SETTLED", LocalDateTime.now().minusDays(3)));

            System.out.println(">>> Database Seeding Completed Successfully!");
        }
    }
}
