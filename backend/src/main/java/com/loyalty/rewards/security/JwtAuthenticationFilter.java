package com.loyalty.rewards.security;

import com.loyalty.rewards.model.Member;
import com.loyalty.rewards.model.Status;
import com.loyalty.rewards.repository.MemberRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.util.Optional;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private MemberRepository memberRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");
        String userEmail = null;
        String jwtToken = null;

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            jwtToken = authHeader.substring(7);
            try {
                userEmail = jwtUtil.extractEmail(jwtToken);
            } catch (Exception e) {
                logger.error("Failed to parse JWT token: " + e.getMessage());
            }
        }

        if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            Optional<Member> memberOpt = memberRepository.findByEmail(userEmail.trim().toLowerCase());
            if (!memberOpt.isPresent()) {
                memberOpt = memberRepository.findByPhone(userEmail.trim());
            }
            if (memberOpt.isPresent()) {
                Member member = memberOpt.get();
                if (member.getStatus() == Status.ACTIVE && jwtUtil.isTokenValid(jwtToken, member.getEmail())) {
                    String roleName = member.getRole().name();
                    String authName = roleName.startsWith("ROLE_") ? roleName : "ROLE_" + roleName;
                    SimpleGrantedAuthority authority = new SimpleGrantedAuthority(authName);
                    
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            member, null, Collections.singletonList(authority));
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            }
        }

        filterChain.doFilter(request, response);
    }
}
