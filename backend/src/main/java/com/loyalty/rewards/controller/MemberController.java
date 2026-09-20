package com.loyalty.rewards.controller;

import com.loyalty.rewards.dto.ChangePasswordRequest;
import com.loyalty.rewards.dto.LoginRequest;
import com.loyalty.rewards.dto.LoginResponse;
import com.loyalty.rewards.dto.PointsRequest;
import com.loyalty.rewards.dto.RegisterRequest;
import com.loyalty.rewards.model.Member;
import com.loyalty.rewards.model.Role;
import com.loyalty.rewards.model.Status;
import com.loyalty.rewards.model.Tier;
import com.loyalty.rewards.service.MemberService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/members")
@CrossOrigin
public class MemberController {

    @Autowired
    private MemberService memberService;

    private boolean isSuperAdmin(Authentication authentication) {
        if (authentication == null) return false;
        for (GrantedAuthority authority : authentication.getAuthorities()) {
            String a = authority.getAuthority();
            if ("ROLE_SUPER_ADMIN".equalsIgnoreCase(a) || "SUPER_ADMIN".equalsIgnoreCase(a)) {
                return true;
            }
        }
        if (authentication.getPrincipal() instanceof Member) {
            Member m = (Member) authentication.getPrincipal();
            return m.getRole() == Role.SUPER_ADMIN;
        }
        return false;
    }

    private boolean isLoyaltyManager(Authentication authentication) {
        if (authentication == null) return false;
        for (GrantedAuthority authority : authentication.getAuthorities()) {
            String a = authority.getAuthority();
            if ("ROLE_LOYALTY_MANAGER".equalsIgnoreCase(a) || "LOYALTY_MANAGER".equalsIgnoreCase(a)) {
                return true;
            }
        }
        if (authentication.getPrincipal() instanceof Member) {
            Member m = (Member) authentication.getPrincipal();
            return m.getRole() == Role.LOYALTY_MANAGER;
        }
        return false;
    }

    private boolean isStaff(Authentication authentication) {
        if (authentication == null) return false;
        for (GrantedAuthority authority : authentication.getAuthorities()) {
            String a = authority.getAuthority();
            if ("ROLE_STAFF".equalsIgnoreCase(a) || "STAFF".equalsIgnoreCase(a)) {
                return true;
            }
        }
        if (authentication.getPrincipal() instanceof Member) {
            Member m = (Member) authentication.getPrincipal();
            return m.getRole() == Role.STAFF;
        }
        return false;
    }

    private Member getAuthenticatedMember(Authentication authentication) {
        if (authentication != null && authentication.getPrincipal() instanceof Member) {
            return (Member) authentication.getPrincipal();
        }
        return null;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
        return ResponseEntity.ok(memberService.login(request));
    }

    @PostMapping("/register")
    public ResponseEntity<Member> register(@RequestBody RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(memberService.register(request));
    }

    @GetMapping("/me")
    public ResponseEntity<Member> getCurrentUser(Authentication authentication) {
        Member current = getAuthenticatedMember(authentication);
        if (current == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthenticated");
        }
        return ResponseEntity.ok(memberService.getMemberById(current.getMemberId()));
    }

    @PostMapping("/change-password")
    public ResponseEntity<Map<String, String>> changePassword(
            @RequestBody ChangePasswordRequest request,
            Authentication authentication) {
        
        Member current = getAuthenticatedMember(authentication);
        if (current == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthenticated");
        }
        if (request == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Request body is required.");
        }

        memberService.changePassword(
            current.getMemberId(),
            request.getCurrentPassword(),
            request.getNewPassword(),
            request.getConfirmNewPassword()
        );

        return ResponseEntity.ok(Map.of("message", "Password changed successfully."));
    }

    @PostMapping
    public ResponseEntity<Member> createMember(@RequestBody Member member, Authentication authentication) {
        Member current = getAuthenticatedMember(authentication);
        if (current != null && current.getRole() == Role.CUSTOMER) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Customers are not authorized to create member accounts.");
        }
        if (isStaff(authentication)) {
            member.setRole(Role.CUSTOMER); // STAFF creates CUSTOMER role only
        } else if (isLoyaltyManager(authentication)) {
            if (member.getRole() == Role.SUPER_ADMIN || member.getRole() == Role.LOYALTY_MANAGER) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access Denied: LOYALTY_MANAGER is not authorized to create SUPER_ADMIN or LOYALTY_MANAGER accounts.");
            }
        } else if (isSuperAdmin(authentication)) {
            if (member.getRole() == Role.SUPER_ADMIN) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access Denied: Creating SUPER_ADMIN via member registration endpoint is not allowed.");
            }
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(memberService.createMember(member, current));
    }

    @GetMapping
    public ResponseEntity<List<Member>> getAllMembers(Authentication authentication) {
        Member current = getAuthenticatedMember(authentication);
        if (current != null && current.getRole() == Role.CUSTOMER) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Customers cannot view all members.");
        }
        List<Member> all = memberService.getAllMembers();
        if (isStaff(authentication)) {
            List<Member> customerOnly = all.stream()
                    .filter(m -> m.getRole() == Role.CUSTOMER)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(customerOnly);
        }
        if (isLoyaltyManager(authentication)) {
            List<Member> managerAllowed = all.stream()
                    .filter(m -> m.getRole() != Role.SUPER_ADMIN)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(managerAllowed);
        }
        return ResponseEntity.ok(all);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Member> getMemberById(@PathVariable Long id, Authentication authentication) {
        Member current = getAuthenticatedMember(authentication);
        if (current != null && current.getRole() == Role.CUSTOMER && !current.getMemberId().equals(id)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Customers can only view their own account profile.");
        }
        Member target = memberService.getMemberById(id);
        if (isStaff(authentication) && target != null && target.getRole() != Role.CUSTOMER) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access Denied: STAFF users are authorized to access CUSTOMER accounts only.");
        }
        if (isLoyaltyManager(authentication) && target != null && target.getRole() == Role.SUPER_ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access Denied: LOYALTY_MANAGER users cannot view SUPER_ADMIN account details.");
        }
        return ResponseEntity.ok(target);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Member> updateMember(
            @PathVariable Long id, 
            @RequestBody Member memberDetails, 
            Authentication authentication) {
        Member current = getAuthenticatedMember(authentication);
        if (current != null && current.getRole() == Role.CUSTOMER && !current.getMemberId().equals(id)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Customers can only update their own profile.");
        }
        Member target = memberService.getMemberById(id);
        if (isStaff(authentication) && target != null && target.getRole() != Role.CUSTOMER) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access Denied: STAFF users are authorized to update CUSTOMER accounts only.");
        }
        if (isLoyaltyManager(authentication) && target != null && target.getRole() == Role.SUPER_ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access Denied: LOYALTY_MANAGER users cannot edit SUPER_ADMIN accounts.");
        }
        return ResponseEntity.ok(memberService.updateMember(id, memberDetails, current));
    }

    @PutMapping("/{id}/role")
    public ResponseEntity<Member> updateMemberRole(
            @PathVariable Long id, 
            @RequestBody Map<String, String> body, 
            Authentication authentication) {
        
        if (!isSuperAdmin(authentication)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access Denied: Only SUPER_ADMIN can modify member roles.");
        }

        String roleStr = body.get("role");
        if (roleStr == null || roleStr.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Role field is required.");
        }

        Role newRole;
        try {
            newRole = Role.valueOf(roleStr.trim().toUpperCase());
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid role value. Allowed: SUPER_ADMIN, LOYALTY_MANAGER, STAFF, CUSTOMER");
        }

        if (newRole == Role.SUPER_ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access Denied: Assigning SUPER_ADMIN role is strictly prohibited.");
        }

        return ResponseEntity.ok(memberService.updateMemberRole(id, newRole));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMember(@PathVariable Long id, Authentication authentication) {
        Member current = getAuthenticatedMember(authentication);
        if (current != null && current.getRole() == Role.CUSTOMER) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Customers cannot delete member accounts.");
        }
        Member target = memberService.getMemberById(id);
        if (isStaff(authentication)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access Denied: STAFF users cannot delete member accounts.");
        }
        if (isLoyaltyManager(authentication)) {
            if (target != null && target.getRole() == Role.SUPER_ADMIN) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access Denied: LOYALTY_MANAGER users cannot delete SUPER_ADMIN accounts.");
            }
        }
        if (!isSuperAdmin(authentication) && !isLoyaltyManager(authentication)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only authorized admin users can delete member accounts.");
        }
        memberService.deleteMember(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/search")
    public ResponseEntity<List<Member>> searchByName(
            @RequestParam(name = "name", required = false) String name,
            Authentication authentication) {
        Member current = getAuthenticatedMember(authentication);
        if (current != null && current.getRole() == Role.CUSTOMER) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Customers cannot search all members.");
        }
        List<Member> results = (name == null || name.isBlank()) ? memberService.getAllMembers() : memberService.searchByName(name);
        if (isStaff(authentication)) {
            results = results.stream().filter(m -> m.getRole() == Role.CUSTOMER).collect(Collectors.toList());
        } else if (isLoyaltyManager(authentication)) {
            results = results.stream().filter(m -> m.getRole() != Role.SUPER_ADMIN).collect(Collectors.toList());
        }
        return ResponseEntity.ok(results);
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<Member>> getByStatus(@PathVariable Status status, Authentication authentication) {
        Member current = getAuthenticatedMember(authentication);
        if (current != null && current.getRole() == Role.CUSTOMER) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Customers cannot search members by status.");
        }
        List<Member> results = memberService.getByStatus(status);
        if (isStaff(authentication)) {
            results = results.stream().filter(m -> m.getRole() == Role.CUSTOMER).collect(Collectors.toList());
        } else if (isLoyaltyManager(authentication)) {
            results = results.stream().filter(m -> m.getRole() != Role.SUPER_ADMIN).collect(Collectors.toList());
        }
        return ResponseEntity.ok(results);
    }

    @GetMapping("/tier/{tier}")
    public ResponseEntity<List<Member>> getByTier(@PathVariable Tier tier, Authentication authentication) {
        Member current = getAuthenticatedMember(authentication);
        if (current != null && current.getRole() == Role.CUSTOMER) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Customers cannot search members by tier.");
        }
        List<Member> results = memberService.getByTier(tier);
        if (isStaff(authentication)) {
            results = results.stream().filter(m -> m.getRole() == Role.CUSTOMER).collect(Collectors.toList());
        } else if (isLoyaltyManager(authentication)) {
            results = results.stream().filter(m -> m.getRole() != Role.SUPER_ADMIN).collect(Collectors.toList());
        }
        return ResponseEntity.ok(results);
    }

    @PostMapping("/{id}/earn-points")
    public ResponseEntity<Member> earnPoints(
            @PathVariable Long id,
            @RequestParam(name = "points", required = false) Integer queryPoints,
            @RequestParam(name = "billAmount", required = false) Double queryBillAmount,
            @RequestBody(required = false) PointsRequest body,
            Authentication authentication) {
        
        Member current = getAuthenticatedMember(authentication);
        if (current != null && current.getRole() == Role.CUSTOMER) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Customers are not authorized to manage points.");
        }

        Member target = memberService.getMemberById(id);
        if (isStaff(authentication) && target != null && target.getRole() != Role.CUSTOMER) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access Denied: STAFF users can add points to CUSTOMER accounts only.");
        }
        if (isLoyaltyManager(authentication) && target != null && target.getRole() == Role.SUPER_ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access Denied: LOYALTY_MANAGER users cannot manage SUPER_ADMIN points.");
        }

        Double bill = (queryBillAmount != null) ? queryBillAmount : (body != null ? body.getBillAmount() : null);
        Integer pts = (queryPoints != null) ? queryPoints : (body != null ? body.getPoints() : null);
        String desc = (body != null) ? body.getDescription() : null;
        Member performer = getAuthenticatedMember(authentication);
        return ResponseEntity.ok(memberService.earnPoints(id, bill, pts, desc, performer));
    }

    @PostMapping("/{id}/deduct-points")
    public ResponseEntity<Member> deductPoints(
            @PathVariable Long id,
            @RequestParam(name = "points", required = false) Integer queryPoints,
            @RequestBody(required = false) PointsRequest body,
            Authentication authentication) {
        
        Member current = getAuthenticatedMember(authentication);
        if (current != null && current.getRole() == Role.CUSTOMER) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Customers are not authorized to manage points.");
        }

        Member target = memberService.getMemberById(id);
        if (isStaff(authentication) && target != null && target.getRole() != Role.CUSTOMER) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access Denied: STAFF users can deduct points from CUSTOMER accounts only.");
        }
        if (isLoyaltyManager(authentication) && target != null && target.getRole() == Role.SUPER_ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access Denied: LOYALTY_MANAGER users cannot manage SUPER_ADMIN points.");
        }

        Integer pts = (queryPoints != null) ? queryPoints : (body != null ? body.getPoints() : null);
        String desc = (body != null) ? body.getDescription() : "Points Deducted";
        Member performer = getAuthenticatedMember(authentication);
        return ResponseEntity.ok(memberService.deductPoints(id, pts, desc, performer));
    }
}
