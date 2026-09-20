package com.loyalty.rewards.controller;

import com.loyalty.rewards.model.Member;
import com.loyalty.rewards.model.Role;
import com.loyalty.rewards.model.Transaction;
import com.loyalty.rewards.model.TransactionType;
import com.loyalty.rewards.service.TransactionExportService;
import com.loyalty.rewards.service.TransactionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/transactions")
@CrossOrigin
public class TransactionController {

    @Autowired
    private TransactionService transactionService;

    @Autowired
    private TransactionExportService transactionExportService;

    @Autowired
    private com.loyalty.rewards.service.MemberService memberService;

    private Member getAuthenticatedMember(Authentication authentication) {
        if (authentication != null && authentication.getPrincipal() instanceof Member) {
            return (Member) authentication.getPrincipal();
        }
        return null;
    }

    @GetMapping
    public ResponseEntity<List<Transaction>> getAllTransactions(Authentication authentication) {
        Member current = getAuthenticatedMember(authentication);
        if (current != null && current.getRole() == Role.CUSTOMER) {
            return ResponseEntity.ok(transactionService.getTransactionsByMemberId(current.getMemberId()));
        }
        List<Transaction> all = transactionService.getAllTransactions();
        if (current != null && current.getRole() == Role.STAFF) {
            List<Transaction> customerOnly = all.stream()
                    .filter(t -> t.getMember() != null && t.getMember().getRole() == Role.CUSTOMER)
                    .collect(java.util.stream.Collectors.toList());
            return ResponseEntity.ok(customerOnly);
        }
        if (current != null && current.getRole() == Role.LOYALTY_MANAGER) {
            List<Transaction> managerAllowed = all.stream()
                    .filter(t -> t.getMember() != null && t.getMember().getRole() != Role.SUPER_ADMIN)
                    .collect(java.util.stream.Collectors.toList());
            return ResponseEntity.ok(managerAllowed);
        }
        return ResponseEntity.ok(all);
    }

    @GetMapping("/me")
    public ResponseEntity<List<Transaction>> getMyTransactions(Authentication authentication) {
        Member current = getAuthenticatedMember(authentication);
        if (current == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthenticated");
        }
        return ResponseEntity.ok(transactionService.getTransactionsByMemberId(current.getMemberId()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Transaction> getTransactionById(@PathVariable Long id, Authentication authentication) {
        Transaction tx = transactionService.getTransactionById(id);
        Member current = getAuthenticatedMember(authentication);
        if (current != null) {
            if (current.getRole() == Role.CUSTOMER) {
                if (tx.getMember() == null || !tx.getMember().getMemberId().equals(current.getMemberId())) {
                    throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Customers can only view their own transactions.");
                }
            } else if (current.getRole() == Role.STAFF) {
                if (tx.getMember() != null && tx.getMember().getRole() != Role.CUSTOMER) {
                    throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access Denied: STAFF users can view CUSTOMER transactions only.");
                }
            } else if (current.getRole() == Role.LOYALTY_MANAGER) {
                if (tx.getMember() != null && tx.getMember().getRole() == Role.SUPER_ADMIN) {
                    throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access Denied: LOYALTY_MANAGER users cannot view SUPER_ADMIN transactions.");
                }
            }
        }
        return ResponseEntity.ok(tx);
    }

    @GetMapping("/member/{memberId}")
    public ResponseEntity<List<Transaction>> getTransactionsByMemberId(@PathVariable Long memberId, Authentication authentication) {
        Member current = getAuthenticatedMember(authentication);
        if (current != null) {
            if (current.getRole() == Role.CUSTOMER && !current.getMemberId().equals(memberId)) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Customers can only view their own transactions.");
            }
            Member targetMember = memberService.getMemberById(memberId);
            if (current.getRole() == Role.STAFF && targetMember != null && targetMember.getRole() != Role.CUSTOMER) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access Denied: STAFF users can view CUSTOMER transactions only.");
            }
            if (current.getRole() == Role.LOYALTY_MANAGER && targetMember != null && targetMember.getRole() == Role.SUPER_ADMIN) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access Denied: LOYALTY_MANAGER users cannot view SUPER_ADMIN transactions.");
            }
        }
        return ResponseEntity.ok(transactionService.getTransactionsByMemberId(memberId));
    }

    @GetMapping("/type/{type}")
    public ResponseEntity<List<Transaction>> getTransactionsByType(@PathVariable TransactionType type, Authentication authentication) {
        Member current = getAuthenticatedMember(authentication);
        if (current != null && current.getRole() == Role.CUSTOMER) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Customers cannot search all transactions by type.");
        }
        List<Transaction> results = transactionService.getTransactionsByType(type);
        if (current != null && current.getRole() == Role.STAFF) {
            results = results.stream().filter(t -> t.getMember() != null && t.getMember().getRole() == Role.CUSTOMER).collect(java.util.stream.Collectors.toList());
        } else if (current != null && current.getRole() == Role.LOYALTY_MANAGER) {
            results = results.stream().filter(t -> t.getMember() != null && t.getMember().getRole() != Role.SUPER_ADMIN).collect(java.util.stream.Collectors.toList());
        }
        return ResponseEntity.ok(results);
    }

    // ==========================================
    // EXPORT ENDPOINTS (SUPER_ADMIN ONLY)
    // ==========================================

    @GetMapping("/export/csv")
    public ResponseEntity<byte[]> exportTransactionsCsv(
            @RequestParam(required = false) Long customerId,
            @RequestParam(required = false) String customerName,
            @RequestParam(required = false) Long performedBy,
            @RequestParam(required = false) Role performedByRole,
            @RequestParam(required = false) TransactionType transactionType,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) Integer minPoints,
            @RequestParam(required = false) Integer maxPoints,
            Authentication authentication) {

        Member current = verifySuperAdmin(authentication);

        validateRanges(startDate, endDate, minPoints, maxPoints);

        List<Transaction> transactions = transactionExportService.getFilteredTransactions(
                customerId, customerName, performedBy, performedByRole,
                transactionType, startDate, endDate, minPoints, maxPoints);

        String summary = transactionExportService.buildFiltersSummary(
                customerId, customerName, performedBy, performedByRole,
                transactionType, startDate, endDate, minPoints, maxPoints);

        byte[] csvData = transactionExportService.generateCsvExport(transactions, current, summary);

        String filename = buildFilename("csv", transactionType);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("text/csv; charset=UTF-8"));
        headers.setContentDispositionFormData("attachment", filename);

        return new ResponseEntity<>(csvData, headers, HttpStatus.OK);
    }

    @GetMapping("/export/pdf")
    public ResponseEntity<byte[]> exportTransactionsPdf(
            @RequestParam(required = false) Long customerId,
            @RequestParam(required = false) String customerName,
            @RequestParam(required = false) Long performedBy,
            @RequestParam(required = false) Role performedByRole,
            @RequestParam(required = false) TransactionType transactionType,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) Integer minPoints,
            @RequestParam(required = false) Integer maxPoints,
            Authentication authentication) {

        Member current = verifySuperAdmin(authentication);

        validateRanges(startDate, endDate, minPoints, maxPoints);

        List<Transaction> transactions = transactionExportService.getFilteredTransactions(
                customerId, customerName, performedBy, performedByRole,
                transactionType, startDate, endDate, minPoints, maxPoints);

        String summary = transactionExportService.buildFiltersSummary(
                customerId, customerName, performedBy, performedByRole,
                transactionType, startDate, endDate, minPoints, maxPoints);

        byte[] pdfData = transactionExportService.generatePdfExport(transactions, current, summary);

        String filename = buildFilename("pdf", transactionType);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", filename);

        return new ResponseEntity<>(pdfData, headers, HttpStatus.OK);
    }

    private Member verifySuperAdmin(Authentication authentication) {
        Member current = getAuthenticatedMember(authentication);
        if (current == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthenticated");
        }
        if (current.getRole() != Role.SUPER_ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access Denied: Only SUPER_ADMIN users are authorized to export transaction history.");
        }
        return current;
    }

    private void validateRanges(LocalDate startDate, LocalDate endDate, Integer minPoints, Integer maxPoints) {
        if (startDate != null && endDate != null && startDate.isAfter(endDate)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid date range: startDate cannot be after endDate.");
        }
        if (minPoints != null && maxPoints != null && minPoints > maxPoints) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid point range: minPoints cannot be greater than maxPoints.");
        }
    }

    private String buildFilename(String extension, TransactionType transactionType) {
        String today = LocalDate.now().toString();
        if (transactionType != null) {
            return "loyalty_transaction_history_" + transactionType.name() + "_" + today + "." + extension;
        }
        return "loyalty_transaction_history_" + today + "." + extension;
    }
}
