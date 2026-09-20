package com.loyalty.rewards.dto;

import com.loyalty.rewards.model.Role;

public class LoginResponse {
    private String token;
    private Long memberId;
    private String fullName;
    private String email;
    private Role role;
    private boolean defaultPassword;

    public LoginResponse() {}

    public LoginResponse(String token, Long memberId, String fullName, String email, Role role) {
        this.token = token;
        this.memberId = memberId;
        this.fullName = fullName;
        this.email = email;
        this.role = role;
        this.defaultPassword = false;
    }

    public LoginResponse(String token, Long memberId, String fullName, String email, Role role, boolean defaultPassword) {
        this.token = token;
        this.memberId = memberId;
        this.fullName = fullName;
        this.email = email;
        this.role = role;
        this.defaultPassword = defaultPassword;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
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

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public boolean isDefaultPassword() {
        return defaultPassword;
    }

    public void setDefaultPassword(boolean defaultPassword) {
        this.defaultPassword = defaultPassword;
    }
}
