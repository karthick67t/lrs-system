package com.loyalty.rewards.model;

import jakarta.persistence.*;

@Entity
@Table(name = "challenges")
public class Challenge {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long challengeId;

    @Column(nullable = false)
    private String name;

    private String description;

    @Column(nullable = false)
    private Integer target = 100;

    @Column(nullable = false)
    private Integer progress = 0;

    private String category;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status = Status.ACTIVE;

    public Challenge() {}

    public Challenge(String name, String description, Integer target, Integer progress, String category, Status status) {
        this.name = name;
        this.description = description;
        this.target = target != null ? target : 100;
        this.progress = progress != null ? progress : 0;
        this.category = category;
        this.status = status != null ? status : Status.ACTIVE;
    }

    public Long getChallengeId() {
        return challengeId;
    }

    public void setChallengeId(Long challengeId) {
        this.challengeId = challengeId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Integer getTarget() {
        return target;
    }

    public void setTarget(Integer target) {
        this.target = target;
    }

    public Integer getProgress() {
        return progress;
    }

    public void setProgress(Integer progress) {
        this.progress = progress;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public Status getStatus() {
        return status;
    }

    public void setStatus(Status status) {
        this.status = status;
    }
}
