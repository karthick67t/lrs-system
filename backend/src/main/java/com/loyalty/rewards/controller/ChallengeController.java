package com.loyalty.rewards.controller;

import com.loyalty.rewards.model.Challenge;
import com.loyalty.rewards.model.Status;
import com.loyalty.rewards.service.ChallengeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/challenges")
@CrossOrigin
public class ChallengeController {

    @Autowired
    private ChallengeService challengeService;

    @GetMapping
    public ResponseEntity<List<Challenge>> getAllChallenges() {
        return ResponseEntity.ok(challengeService.getAllChallenges());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Challenge> getChallengeById(@PathVariable Long id) {
        return ResponseEntity.ok(challengeService.getChallengeById(id));
    }

    @PostMapping
    public ResponseEntity<Challenge> createChallenge(@RequestBody Challenge challenge) {
        return ResponseEntity.status(HttpStatus.CREATED).body(challengeService.createChallenge(challenge));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Challenge> updateChallenge(@PathVariable Long id, @RequestBody Challenge details) {
        return ResponseEntity.ok(challengeService.updateChallenge(id, details));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteChallenge(@PathVariable Long id) {
        challengeService.deleteChallenge(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/progress")
    public ResponseEntity<Challenge> updateProgress(@PathVariable Long id, @RequestParam("progress") Integer progress) {
        return ResponseEntity.ok(challengeService.updateProgress(id, progress));
    }

    @GetMapping("/search")
    public ResponseEntity<List<Challenge>> searchByName(@RequestParam(name = "name", required = false) String name) {
        if (name == null || name.isBlank()) return ResponseEntity.ok(challengeService.getAllChallenges());
        return ResponseEntity.ok(challengeService.searchByName(name));
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<List<Challenge>> getByCategory(@PathVariable String category) {
        return ResponseEntity.ok(challengeService.getByCategory(category));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<Challenge>> getByStatus(@PathVariable Status status) {
        return ResponseEntity.ok(challengeService.getByStatus(status));
    }
}
