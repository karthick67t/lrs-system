package com.loyalty.rewards.service;

import com.loyalty.rewards.dto.LoginRequest;
import com.loyalty.rewards.dto.LoginResponse;
import com.loyalty.rewards.dto.RegisterRequest;
import com.loyalty.rewards.model.*;
import com.loyalty.rewards.repository.MemberRepository;
import com.loyalty.rewards.repository.TransactionRepository;
import com.loyalty.rewards.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

@Service
public class MemberService {

    @Autowired
    private MemberRepository memberRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private JwtUtil jwtUtil;

    public LoginResponse login(LoginRequest request) {
        if (request.getEmail() == null || request.getPassword() == null || request.getRole() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email, password, and role are required");
        }

        String identifier = request.getEmail().trim();
        String password = request.getPassword().trim();

        // Support lookup by Email, Phone number, or Member ID
        Optional<Member> memberOpt = memberRepository.findByEmail(identifier.toLowerCase());

        if (!memberOpt.isPresent()) {
            memberOpt = memberRepository.findByPhone(identifier);
        }

        if (!memberOpt.isPresent()) {
            String cleanId = identifier.startsWith("#") ? identifier.substring(1).trim() : identifier;
            try {
                Long id = Long.parseLong(cleanId);
                memberOpt = memberRepository.findById(id);
            } catch (NumberFormatException ignored) {}
        }

        Member member = memberOpt.orElseThrow(() -> 
            new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password"));

        if (member.getPassword() == null || !member.getPassword().trim().equals(password)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password");
        }

        if (member.getStatus() != Status.ACTIVE) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Account is INACTIVE. Please contact admin.");
        }

        if (member.getRole() != request.getRole()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, 
                "Role mismatch: Login role does not match assigned system role (" + member.getRole() + ")");
        }

        String token = jwtUtil.generateToken(member.getEmail(), member.getRole(), member.getMemberId(), member.getFullName());
        boolean isDefPass = member.getPassword() != null && member.getPhone() != null && member.getPassword().trim().equals(member.getPhone().trim());
        return new LoginResponse(token, member.getMemberId(), member.getFullName(), member.getEmail(), member.getRole(), isDefPass);
    }

    public Member register(RegisterRequest request) {
        if (request.getEmail() == null || request.getPassword() == null || request.getFullName() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Full name, email, and password are required");
        }

        if (request.getConfirmPassword() != null && !request.getPassword().equals(request.getConfirmPassword())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Passwords do not match");
        }

        String emailClean = request.getEmail().trim().toLowerCase();
        if (memberRepository.findByEmail(emailClean).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email address is already registered");
        }

        // Public registration rule: Default role is always CUSTOMER
        Member newMember = new Member();
        newMember.setFullName(request.getFullName().trim());
        newMember.setEmail(emailClean);
        newMember.setPhone(request.getPhone());
        newMember.setPassword(request.getPassword());
        newMember.setPoints(0);
        newMember.setStatus(Status.ACTIVE);
        newMember.setTier(Tier.BRONZE);
        newMember.setRole(Role.CUSTOMER); // Public registration always creates CUSTOMER

        return memberRepository.save(newMember);
    }

    @Autowired
    private PointsExpiryService pointsExpiryService;

    @Autowired
    private FraudService fraudService;

    @Transactional
    public Member earnPoints(Long memberId, Double billAmount, Integer points, String description, Member performer) {
        if (performer != null) {
            if (performer.getRole() == Role.CUSTOMER) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Customers are not authorized to add points manually.");
            }
            if (performer.getMemberId() != null && performer.getMemberId().equals(memberId)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Staff members cannot add points to their own account through customer point-management operations.");
            }
        }

        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Member not found with ID: " + memberId));

        if (member.getRole() != Role.CUSTOMER) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Point operations can only be performed on CUSTOMER accounts.");
        }

        int calculatedPoints = 0;
        if (billAmount != null && billAmount > 0) {
            calculatedPoints = (int) Math.floor(billAmount / 10.0);
            if (calculatedPoints <= 0) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Bill amount must be at least ₹10 to earn points (1 pt per ₹10 spent).");
            }
        } else if (points != null && points > 0) {
            calculatedPoints = points;
        } else {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Bill amount or points must be greater than zero.");
        }

        int previousBalance = member.getPoints();
        int newBalance = previousBalance + calculatedPoints;

        member.setPoints(newBalance);
        member.recalculateTier();
        Member updatedMember = memberRepository.save(member);

        String desc = (description != null && !description.isBlank()) 
            ? description 
            : (billAmount != null ? "Earned " + calculatedPoints + " pts on Purchase Bill ₹" + String.format("%.2f", billAmount) : "Points Earned");

        Long perfId = (performer != null) ? performer.getMemberId() : null;
        String perfName = (performer != null) ? performer.getFullName() : "System Admin";
        Role perfRole = (performer != null) ? performer.getRole() : Role.SUPER_ADMIN;

        Transaction tx = new Transaction(
            updatedMember, billAmount, calculatedPoints, previousBalance, newBalance,
            TransactionType.EARN, desc, perfId, perfName, perfRole
        );
        Transaction savedTx = transactionRepository.save(tx);

        // Track point lot creation & run real-time fraud evaluation
        pointsExpiryService.createLot(updatedMember.getMemberId(), calculatedPoints, savedTx.getTransactionId());
        fraudService.evaluateTransaction(savedTx, updatedMember, performer);

        return updatedMember;
    }

    @Transactional
    public Member earnPoints(Long memberId, Integer points, String description, Member performer) {
        return earnPoints(memberId, null, points, description, performer);
    }

    @Transactional
    public Member deductPoints(Long memberId, Integer points, String description, Member performer) {
        if (points == null || points <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Points to deduct must be greater than zero.");
        }

        if (performer != null) {
            if (performer.getRole() == Role.CUSTOMER) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Customers are not authorized to deduct points manually.");
            }
            if (performer.getMemberId() != null && performer.getMemberId().equals(memberId)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Staff members cannot deduct points from their own account through customer point-management operations.");
            }
        }

        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Member not found with ID: " + memberId));

        if (member.getRole() != Role.CUSTOMER) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Point operations can only be performed on CUSTOMER accounts.");
        }

        if (member.getPoints() < points) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Insufficient points balance (Available: " + member.getPoints() + ")");
        }

        int previousBalance = member.getPoints();
        int newBalance = previousBalance - points;

        member.setPoints(newBalance);
        member.recalculateTier();
        Member updatedMember = memberRepository.save(member);

        String desc = (description != null && !description.isBlank()) ? description : "Points Deducted";

        Long perfId = (performer != null) ? performer.getMemberId() : null;
        String perfName = (performer != null) ? performer.getFullName() : "System Admin";
        Role perfRole = (performer != null) ? performer.getRole() : Role.SUPER_ADMIN;

        Transaction tx = new Transaction(
            updatedMember, points, previousBalance, newBalance,
            TransactionType.DEDUCT, desc, perfId, perfName, perfRole
        );
        Transaction savedTx = transactionRepository.save(tx);

        // Consume FIFO point lots & run real-time fraud evaluation
        pointsExpiryService.consumePoints(updatedMember.getMemberId(), points);
        fraudService.evaluateTransaction(savedTx, updatedMember, performer);

        return updatedMember;
    }

    public List<Member> getAllMembers() {
        return memberRepository.findAll();
    }

    public Member getMemberById(Long id) {
        return memberRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Member not found with ID: " + id));
    }

    public Member createMember(Member member, Member creator) {
        if (creator != null && creator.getRole() == Role.CUSTOMER) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Customers are not authorized to create members.");
        }

        if (member.getEmail() == null || memberRepository.findByEmail(member.getEmail().trim().toLowerCase()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Member with email already exists");
        }
        member.setEmail(member.getEmail().trim().toLowerCase());
        if (member.getPhone() != null) {
            member.setPhone(member.getPhone().trim());
        }
        if (member.getPoints() == null) member.setPoints(0);

        Role creatorRole = (creator != null) ? creator.getRole() : Role.SUPER_ADMIN;

        // Enforce Critical Security Rule & Role Hierarchy:
        // STAFF -> CUSTOMER (automatic)
        // LOYALTY_MANAGER -> CUSTOMER or STAFF only (no SUPER_ADMIN, no LOYALTY_MANAGER)
        // SUPER_ADMIN -> CUSTOMER, STAFF, or LOYALTY_MANAGER (no SUPER_ADMIN creation)
        if (creatorRole == Role.STAFF) {
            member.setRole(Role.CUSTOMER);
            if (member.getPhone() != null && !member.getPhone().isBlank()) {
                member.setPassword(member.getPhone().trim());
            }
        } else if (creatorRole == Role.LOYALTY_MANAGER) {
            if (member.getRole() == Role.SUPER_ADMIN || member.getRole() == Role.LOYALTY_MANAGER) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access Denied: LOYALTY_MANAGER cannot create SUPER_ADMIN or LOYALTY_MANAGER accounts.");
            }
            if (member.getRole() != Role.STAFF) {
                member.setRole(Role.CUSTOMER);
            }
        } else if (creatorRole == Role.SUPER_ADMIN) {
            if (member.getRole() == Role.SUPER_ADMIN) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access Denied: Creating SUPER_ADMIN via member registration endpoint is not allowed.");
            }
            if (member.getRole() != Role.STAFF && member.getRole() != Role.LOYALTY_MANAGER) {
                member.setRole(Role.CUSTOMER);
            }
        } else {
            member.setRole(Role.CUSTOMER);
        }

        if (member.getPassword() == null || member.getPassword().isBlank()) {
            if (member.getPhone() != null && !member.getPhone().isBlank()) {
                member.setPassword(member.getPhone().trim());
            } else {
                member.setPassword("customer123");
            }
        } else {
            member.setPassword(member.getPassword().trim());
        }

        if (member.getStatus() == null) member.setStatus(Status.ACTIVE);
        member.recalculateTier();
        return memberRepository.save(member);
    }

    public void changePassword(Long memberId, String currentPassword, String newPassword, String confirmNewPassword) {
        if (newPassword == null || newPassword.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "New password cannot be empty");
        }
        if (!newPassword.equals(confirmNewPassword)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "New password and confirm password do not match");
        }
        Member member = getMemberById(memberId);
        if (currentPassword == null || !member.getPassword().equals(currentPassword)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Current password is incorrect");
        }
        member.setPassword(newPassword.trim());
        memberRepository.save(member);
    }

    public Member updateMember(Long id, Member memberDetails, Member performer) {
        Member member = getMemberById(id);
        Role performerRole = (performer != null) ? performer.getRole() : Role.SUPER_ADMIN;

        if (performerRole == Role.CUSTOMER && !performer.getMemberId().equals(id)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Customers can only update their own profile.");
        }
        if (performerRole == Role.STAFF && member.getRole() != Role.CUSTOMER) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access Denied: STAFF users are authorized to update CUSTOMER accounts only.");
        }
        if (performerRole == Role.LOYALTY_MANAGER && member.getRole() == Role.SUPER_ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access Denied: LOYALTY_MANAGER users cannot edit SUPER_ADMIN accounts.");
        }

        if (memberDetails.getFullName() != null) member.setFullName(memberDetails.getFullName());
        if (memberDetails.getPhone() != null) member.setPhone(memberDetails.getPhone());
        if (memberDetails.getPassword() != null && !memberDetails.getPassword().isBlank()) {
            member.setPassword(memberDetails.getPassword());
        }
        if (memberDetails.getStatus() != null && performerRole != Role.CUSTOMER) {
            member.setStatus(memberDetails.getStatus());
        }

        // Note: Role cannot be updated via general member edit (only via /role endpoint by SUPER_ADMIN).
        // Points cannot be updated directly via general member edit (only via Earn/Deduct/Redeem operations).

        member.recalculateTier();
        return memberRepository.save(member);
    }

    public Member updateMemberRole(Long id, Role newRole) {
        Member member = getMemberById(id);
        if (newRole == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Role cannot be null");
        }
        member.setRole(newRole);
        return memberRepository.save(member);
    }

    public void deleteMember(Long id) {
        Member member = getMemberById(id);
        memberRepository.delete(member);
    }

    public List<Member> searchByName(String name) {
        return memberRepository.findByFullNameContainingIgnoreCase(name);
    }

    public List<Member> getByStatus(Status status) {
        return memberRepository.findByStatus(status);
    }

    public List<Member> getByTier(Tier tier) {
        return memberRepository.findByTier(tier);
    }
}
