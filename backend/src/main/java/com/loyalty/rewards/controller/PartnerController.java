package com.loyalty.rewards.controller;

import com.loyalty.rewards.model.Partner;
import com.loyalty.rewards.model.Status;
import com.loyalty.rewards.service.PartnerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/partners")
@CrossOrigin
public class PartnerController {

    @Autowired
    private PartnerService partnerService;

    @GetMapping
    public ResponseEntity<List<Partner>> getAllPartners() {
        return ResponseEntity.ok(partnerService.getAllPartners());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Partner> getPartnerById(@PathVariable Long id) {
        return ResponseEntity.ok(partnerService.getPartnerById(id));
    }

    @PostMapping
    public ResponseEntity<Partner> createPartner(@RequestBody Partner partner) {
        return ResponseEntity.status(HttpStatus.CREATED).body(partnerService.createPartner(partner));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Partner> updatePartner(@PathVariable Long id, @RequestBody Partner details) {
        return ResponseEntity.ok(partnerService.updatePartner(id, details));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePartner(@PathVariable Long id) {
        partnerService.deletePartner(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/search")
    public ResponseEntity<List<Partner>> searchByName(@RequestParam(name = "name", required = false) String name) {
        if (name == null || name.isBlank()) return ResponseEntity.ok(partnerService.getAllPartners());
        return ResponseEntity.ok(partnerService.searchByName(name));
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<List<Partner>> getByCategory(@PathVariable String category) {
        return ResponseEntity.ok(partnerService.getByCategory(category));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<Partner>> getByStatus(@PathVariable Status status) {
        return ResponseEntity.ok(partnerService.getByStatus(status));
    }
}
