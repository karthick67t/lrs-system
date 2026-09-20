package com.loyalty.rewards.controller;

import com.loyalty.rewards.model.Finance;
import com.loyalty.rewards.service.FinanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/finance")
@CrossOrigin
public class FinanceController {

    @Autowired
    private FinanceService financeService;

    @GetMapping
    public ResponseEntity<List<Finance>> getAllFinanceRecords() {
        return ResponseEntity.ok(financeService.getAllFinanceRecords());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Finance> getFinanceById(@PathVariable Long id) {
        return ResponseEntity.ok(financeService.getFinanceById(id));
    }

    @PostMapping
    public ResponseEntity<Finance> createFinanceRecord(@RequestBody Finance finance) {
        return ResponseEntity.status(HttpStatus.CREATED).body(financeService.createFinanceRecord(finance));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Finance> updateFinanceRecord(@PathVariable Long id, @RequestBody Finance details) {
        return ResponseEntity.ok(financeService.updateFinanceRecord(id, details));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFinanceRecord(@PathVariable Long id) {
        financeService.deleteFinanceRecord(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/search")
    public ResponseEntity<List<Finance>> searchByDescription(@RequestParam(name = "desc", required = false) String desc) {
        if (desc == null || desc.isBlank()) return ResponseEntity.ok(financeService.getAllFinanceRecords());
        return ResponseEntity.ok(financeService.searchByDescription(desc));
    }

    @GetMapping("/type/{type}")
    public ResponseEntity<List<Finance>> getByType(@PathVariable String type) {
        return ResponseEntity.ok(financeService.getByType(type));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<Finance>> getByStatus(@PathVariable String status) {
        return ResponseEntity.ok(financeService.getByStatus(status));
    }
}
