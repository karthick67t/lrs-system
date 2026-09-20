package com.loyalty.rewards.service;

import com.loyalty.rewards.model.Challenge;
import com.loyalty.rewards.model.Status;
import com.loyalty.rewards.repository.ChallengeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class ChallengeService {

    @Autowired
    private ChallengeRepository challengeRepository;

    public List<Challenge> getAllChallenges() {
        return challengeRepository.findAll();
    }

    public Challenge getChallengeById(Long id) {
        return challengeRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Challenge not found with ID: " + id));
    }

    public Challenge createChallenge(Challenge challenge) {
        if (challenge.getName() == null || challenge.getName().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Challenge name is required");
        }
        return challengeRepository.save(challenge);
    }

    public Challenge updateChallenge(Long id, Challenge details) {
        Challenge challenge = getChallengeById(id);
        if (details.getName() != null) challenge.setName(details.getName());
        if (details.getDescription() != null) challenge.setDescription(details.getDescription());
        if (details.getTarget() != null) challenge.setTarget(details.getTarget());
        if (details.getProgress() != null) challenge.setProgress(details.getProgress());
        if (details.getCategory() != null) challenge.setCategory(details.getCategory());
        if (details.getStatus() != null) challenge.setStatus(details.getStatus());
        return challengeRepository.save(challenge);
    }

    public void deleteChallenge(Long id) {
        Challenge challenge = getChallengeById(id);
        challengeRepository.delete(challenge);
    }

    public Challenge updateProgress(Long id, Integer progress) {
        Challenge challenge = getChallengeById(id);
        if (progress == null || progress < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Progress value must be non-negative");
        }
        challenge.setProgress(progress);
        return challengeRepository.save(challenge);
    }

    public List<Challenge> searchByName(String name) {
        return challengeRepository.findByNameContainingIgnoreCase(name);
    }

    public List<Challenge> getByCategory(String category) {
        return challengeRepository.findByCategory(category);
    }

    public List<Challenge> getByStatus(Status status) {
        return challengeRepository.findByStatus(status);
    }
}
