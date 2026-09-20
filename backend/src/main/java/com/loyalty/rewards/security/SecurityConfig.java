package com.loyalty.rewards.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Value("${frontend.url:http://localhost:3000}")
    private String frontendUrl;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(AbstractHttpConfigurer::disable)
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/complaints").permitAll()
                .requestMatchers("/api/members/login", "/api/auth/login", "/api/members/register", "/api/auth/register").permitAll()
                
                // Super Admin Only Role Modification & Admin Endpoints
                .requestMatchers(HttpMethod.PUT, "/api/members/*/role").hasAnyAuthority("ROLE_SUPER_ADMIN", "SUPER_ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/notifications/announcement").hasAnyAuthority("ROLE_SUPER_ADMIN", "SUPER_ADMIN")
                .requestMatchers("/api/program-config/**", "/api/fraud/**", "/api/finance/**", "/api/complaints/**")
                .hasAnyAuthority("ROLE_SUPER_ADMIN", "SUPER_ADMIN")
                
                // Super Admin & Loyalty Manager
                .requestMatchers("/api/challenges/**", "/api/partners/**")
                .hasAnyAuthority("ROLE_SUPER_ADMIN", "SUPER_ADMIN", "ROLE_LOYALTY_MANAGER", "LOYALTY_MANAGER")
                
                // General endpoints accessible by STAFF, LOYALTY_MANAGER, SUPER_ADMIN, CUSTOMER (subject to controller-level checks)
                .requestMatchers("/api/members/**", "/api/transactions/**", "/api/rewards/**", "/api/points-expiry/**", "/api/feedback/**", "/api/notifications/**")
                .hasAnyAuthority("ROLE_SUPER_ADMIN", "SUPER_ADMIN", "ROLE_LOYALTY_MANAGER", "LOYALTY_MANAGER", "ROLE_STAFF", "STAFF", "ROLE_CUSTOMER", "CUSTOMER")
                
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        List<String> origins = new ArrayList<>(Arrays.asList(
            "http://localhost:3000",
            "http://localhost:5173",
            "http://127.0.0.1:3000",
            "http://127.0.0.1:5173"
        ));
        if (frontendUrl != null && !frontendUrl.isBlank()) {
            for (String url : frontendUrl.split(",")) {
                String trimmed = url.trim();
                if (!trimmed.isEmpty() && !origins.contains(trimmed)) {
                    origins.add(trimmed);
                }
            }
        }
        configuration.setAllowedOrigins(origins);
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "Accept", "Origin"));
        configuration.setAllowCredentials(false);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
