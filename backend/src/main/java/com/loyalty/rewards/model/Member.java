package com.loyalty.rewards.model;

import jakarta.persistence.*;

@Entity
@Table(name = "members")
public class Member {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long memberId;

    @Column(nullable = false)
    private String fullName;

    @Column(nullable = false, unique = true)
    private String email;

    private String phone;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private Integer points = 0;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status = Status.ACTIVE;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Tier tier = Tier.BRONZE;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role = Role.STAFF;

    public Member() {}

    public Member(String fullName, String email, String phone, String password, Integer points, Status status, Tier tier, Role role) {
        this.fullName = fullName;
        this.email = email;
        this.phone = phone;
        this.password = password;
        this.points = points != null ? points : 0;
        this.status = status != null ? status : Status.ACTIVE;
        this.role = role != null ? role : Role.STAFF;
        this.tier = Tier.calculateTier(this.points);
    }

    public Long getMemberId() {
        return memberId;
    }

    public void setMemberId(Long memberId) {
        this.memberId = memberId;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public Integer getPoints() {
        return points;
    }

    public void setPoints(Integer points) {
        this.points = points;
        recalculateTier();
    }

    public Status getStatus() {
        return status;
    }

    public void setStatus(Status status) {
        this.status = status;
    }

    public Tier getTier() {
        return tier;
    }

    public void setTier(Tier tier) {
        this.tier = tier;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public void recalculateTier() {
        this.tier = Tier.calculateTier(this.points != null ? this.points : 0);
    }
}
