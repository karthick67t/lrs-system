package com.loyalty.rewards.controller;

import com.loyalty.rewards.dto.ComplaintRequest;
import com.loyalty.rewards.model.Complaint;
import com.loyalty.rewards.model.ComplaintStatus;
import com.loyalty.rewards.service.ComplaintService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/complaints")
@CrossOrigin
public class ComplaintController {

    @Autowired
    private ComplaintService complaintService;

    @PostMapping
    public ResponseEntity<Map<String, Object>> submitComplaint(@RequestBody ComplaintRequest request) {
        Complaint saved = complaintService.submitComplaint(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
            "message", "Your complaint has been submitted successfully. Our team will review it shortly.",
            "complaintId", saved.getComplaintId()
        ));
    }

    @GetMapping
    public ResponseEntity<List<Complaint>> getAllComplaints() {
        return ResponseEntity.ok(complaintService.getAllComplaints());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Complaint> getComplaintById(@PathVariable Long id) {
        return ResponseEntity.ok(complaintService.getComplaintById(id));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Complaint> updateComplaintStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        
        String statusStr = body.get("status");
        if (statusStr == null || statusStr.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Status is required.");
        }

        ComplaintStatus status;
        try {
            status = ComplaintStatus.valueOf(statusStr.trim().toUpperCase());
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid status value. Allowed: NEW, IN_PROGRESS, RESOLVED");
        }

        return ResponseEntity.ok(complaintService.updateComplaintStatus(id, status));
    }
}
