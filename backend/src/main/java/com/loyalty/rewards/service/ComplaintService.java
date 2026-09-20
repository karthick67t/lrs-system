package com.loyalty.rewards.service;

import com.loyalty.rewards.dto.ComplaintRequest;
import com.loyalty.rewards.model.Complaint;
import com.loyalty.rewards.model.ComplaintStatus;
import com.loyalty.rewards.model.Notification;
import com.loyalty.rewards.model.NotificationStatus;
import com.loyalty.rewards.repository.ComplaintRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ComplaintService {

    @Autowired
    private ComplaintRepository complaintRepository;

    @Autowired
    private NotificationService notificationService;

    public Complaint submitComplaint(ComplaintRequest request) {
        if (request == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Complaint payload is required.");
        }
        if (request.getFullName() == null || request.getFullName().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Full Name is required.");
        }
        if (request.getEmail() == null || request.getEmail().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email is required.");
        }
        if (request.getSubject() == null || request.getSubject().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Subject is required.");
        }
        if (request.getMessage() == null || request.getMessage().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Message is required.");
        }

        Complaint complaint = new Complaint(
            request.getFullName().trim(),
            request.getEmail().trim(),
            request.getPhone() != null ? request.getPhone().trim() : null,
            request.getSubject().trim(),
            request.getMessage().trim()
        );

        Complaint saved = complaintRepository.save(complaint);

        // Create notification for SUPER_ADMIN alerting of the new complaint
        Notification notification = new Notification();
        notification.setTitle("New Customer Complaint Received");
        notification.setMessage(String.format(
            "New complaint #%d received from %s (%s). Subject: '%s'. Open Complaints management to view full details.",
            saved.getComplaintId(),
            saved.getFullName(),
            saved.getEmail(),
            saved.getSubject()
        ));
        notification.setType("SYSTEM");
        notification.setStatus(NotificationStatus.SENT);
        notification.setAudience("SUPER_ADMIN");
        notification.setScheduledDate(LocalDateTime.now());

        notificationService.createNotification(notification);

        return saved;
    }

    public List<Complaint> getAllComplaints() {
        return complaintRepository.findAllByOrderByCreatedAtDesc();
    }

    public Complaint getComplaintById(Long id) {
        return complaintRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Complaint not found with ID " + id));
    }

    public Complaint updateComplaintStatus(Long id, ComplaintStatus status) {
        Complaint complaint = getComplaintById(id);
        if (status == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Status value is required.");
        }
        complaint.setStatus(status);
        return complaintRepository.save(complaint);
    }
}
