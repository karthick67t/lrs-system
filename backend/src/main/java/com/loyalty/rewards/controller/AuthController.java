package com.loyalty.rewards.controller;

import com.loyalty.rewards.dto.LoginRequest;
import com.loyalty.rewards.dto.LoginResponse;
import com.loyalty.rewards.dto.RegisterRequest;
import com.loyalty.rewards.model.Member;
import com.loyalty.rewards.service.MemberService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin
public class AuthController {

    @Autowired
    private MemberService memberService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
        return ResponseEntity.ok(memberService.login(request));
    }

    @PostMapping("/register")
    public ResponseEntity<Member> register(@RequestBody RegisterRequest request) {
        return ResponseEntity.ok(memberService.register(request));
    }
}
