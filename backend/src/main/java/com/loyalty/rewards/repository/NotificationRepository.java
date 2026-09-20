package com.loyalty.rewards.repository;

import com.loyalty.rewards.model.Notification;
import com.loyalty.rewards.model.NotificationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByTitleContainingIgnoreCase(String title);
    List<Notification> findByType(String type);
    List<Notification> findByStatus(NotificationStatus status);
    List<Notification> findByAudience(String audience);
}
