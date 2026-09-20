package com.loyalty.rewards.service;

import com.loyalty.rewards.model.Member;
import com.loyalty.rewards.model.Notification;
import com.loyalty.rewards.model.NotificationStatus;
import com.loyalty.rewards.model.Role;
import com.loyalty.rewards.model.Status;
import com.loyalty.rewards.repository.MemberRepository;
import com.loyalty.rewards.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private MemberRepository memberRepository;

    public List<Notification> getAllNotifications() {
        return notificationRepository.findAll();
    }

    public Notification getNotificationById(Long id) {
        return notificationRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Notification not found with ID: " + id));
    }

    public Notification createNotification(Notification notification) {
        if (notification.getTitle() == null || notification.getTitle().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Notification title is required");
        }
        return notificationRepository.save(notification);
    }

    @Transactional
    public Map<String, Object> sendAnnouncement(String title, String message, Member performer) {
        if (performer == null || performer.getRole() != Role.SUPER_ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access Denied: Only SUPER_ADMIN users can send system announcements.");
        }
        if (title == null || title.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Announcement title is required.");
        }
        if (message == null || message.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Announcement message is required.");
        }

        List<Member> allMembers = memberRepository.findAll();
        List<Member> managers = allMembers.stream()
                .filter(m -> m.getRole() == Role.LOYALTY_MANAGER && m.getStatus() == Status.ACTIVE)
                .collect(Collectors.toList());
        List<Member> staff = allMembers.stream()
                .filter(m -> m.getRole() == Role.STAFF && m.getStatus() == Status.ACTIVE)
                .collect(Collectors.toList());

        List<Notification> announcementsToSave = new ArrayList<>();

        for (Member m : managers) {
            Notification n = new Notification(m, title.trim(), message.trim(), "ANNOUNCEMENT");
            n.setStatus(NotificationStatus.SENT);
            n.setScheduledDate(LocalDateTime.now());
            announcementsToSave.add(n);
        }

        for (Member s : staff) {
            Notification n = new Notification(s, title.trim(), message.trim(), "ANNOUNCEMENT");
            n.setStatus(NotificationStatus.SENT);
            n.setScheduledDate(LocalDateTime.now());
            announcementsToSave.add(n);
        }

        notificationRepository.saveAll(announcementsToSave);

        int managersCount = managers.size();
        int staffCount = staff.size();
        int totalSent = announcementsToSave.size();

        String summary = String.format("Announcement sent to %d managers and %d staff members.", managersCount, staffCount);

        Map<String, Object> response = new HashMap<>();
        response.put("message", summary);
        response.put("managersCount", managersCount);
        response.put("staffCount", staffCount);
        response.put("totalSent", totalSent);
        return response;
    }

    public Notification updateNotification(Long id, Notification details) {
        Notification notif = getNotificationById(id);
        if (details.getTitle() != null) notif.setTitle(details.getTitle());
        if (details.getMessage() != null) notif.setMessage(details.getMessage());
        if (details.getType() != null) notif.setType(details.getType());
        if (details.getStatus() != null) notif.setStatus(details.getStatus());
        if (details.getAudience() != null) notif.setAudience(details.getAudience());
        if (details.getScheduledDate() != null) notif.setScheduledDate(details.getScheduledDate());
        return notificationRepository.save(notif);
    }

    public void deleteNotification(Long id) {
        Notification notif = getNotificationById(id);
        notificationRepository.delete(notif);
    }

    public Notification sendNotification(Long id) {
        Notification notif = getNotificationById(id);
        notif.setStatus(NotificationStatus.SENT);
        return notificationRepository.save(notif);
    }

    public Notification cancelNotification(Long id) {
        Notification notif = getNotificationById(id);
        notif.setStatus(NotificationStatus.CANCELLED);
        return notificationRepository.save(notif);
    }

    public List<Notification> searchByTitle(String title) {
        return notificationRepository.findByTitleContainingIgnoreCase(title);
    }

    public List<Notification> getByType(String type) {
        return notificationRepository.findByType(type);
    }

    public List<Notification> getByStatus(NotificationStatus status) {
        return notificationRepository.findByStatus(status);
    }

    public List<Notification> getByAudience(String audience) {
        return notificationRepository.findByAudience(audience);
    }
}
