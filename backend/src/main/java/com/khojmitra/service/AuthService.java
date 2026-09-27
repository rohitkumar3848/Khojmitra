package com.khojmitra.service;

import com.khojmitra.config.JwtService;
import com.khojmitra.dto.*;
import com.khojmitra.model.Role;
import com.khojmitra.model.User;
import com.khojmitra.repository.UserRepository;
import com.khojmitra.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email is already registered: " + request.getEmail());
        }

        Set<Role> roles = new HashSet<>();
        roles.add(Role.ROLE_USER);
        if (Boolean.TRUE.equals(request.getIsAdmin())) {
            roles.add(Role.ROLE_ADMIN);
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail().toLowerCase().trim())
                .password(passwordEncoder.encode(request.getPassword()))
                .roles(roles)
                .department(request.getDepartment())
                .officeLocation(request.getOfficeLocation())
                .phone(request.getPhone())
                .karmaPoints(10)
                .walletBalance(0.0)
                .createdAt(LocalDateTime.now())
                .build();

        user = userRepository.save(user);

        UserPrincipal principal = new UserPrincipal(user);
        String token = jwtService.generateToken(principal, Map.of(
                "roles", user.getRoles(),
                "name", user.getName(),
                "userId", user.getId()
        ));

        return buildAuthResponse(user, token);
    }

    public AuthResponse login(AuthRequest request) {
        String email = request.getEmail().toLowerCase().trim();

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, request.getPassword())
        );

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found with email: " + email));

        UserPrincipal principal = new UserPrincipal(user);
        String token = jwtService.generateToken(principal, Map.of(
                "roles", user.getRoles(),
                "name", user.getName(),
                "userId", user.getId()
        ));

        return buildAuthResponse(user, token);
    }

    public AuthResponse googleAuth(GoogleAuthRequest request) {
        String email = request.getEmail();
        String name = request.getName();
        String avatarUrl = request.getAvatarUrl();

        if (request.getIdToken() != null && !request.getIdToken().isBlank()) {
            try {
                String[] parts = request.getIdToken().split("\\.");
                if (parts.length >= 2) {
                    String payloadJson = new String(java.util.Base64.getUrlDecoder().decode(parts[1]), java.nio.charset.StandardCharsets.UTF_8);
                    com.fasterxml.jackson.databind.JsonNode jsonNode = new com.fasterxml.jackson.databind.ObjectMapper().readTree(payloadJson);
                    if (jsonNode.has("email")) {
                        email = jsonNode.get("email").asText();
                    }
                    if (jsonNode.has("name")) {
                        name = jsonNode.get("name").asText();
                    }
                    if (jsonNode.has("picture")) {
                        avatarUrl = jsonNode.get("picture").asText();
                    }
                }
            } catch (Exception ignored) {
            }
        }

        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("Google authentication failed: Email address is required.");
        }

        email = email.toLowerCase().trim();
        final String finalEmail = email;
        final String finalName = (name != null && !name.isBlank()) ? name : finalEmail.split("@")[0];
        final String finalAvatar = avatarUrl;

        User user = userRepository.findByEmail(finalEmail).orElseGet(() -> {
            Set<Role> roles = new HashSet<>();
            roles.add(Role.ROLE_USER);

            User newUser = User.builder()
                    .name(finalName)
                    .email(finalEmail)
                    .password(passwordEncoder.encode("GOOGLE_OAUTH_" + System.currentTimeMillis()))
                    .roles(roles)
                    .avatarUrl(finalAvatar)
                    .karmaPoints(15)
                    .walletBalance(0.0)
                    .createdAt(LocalDateTime.now())
                    .build();
            return userRepository.save(newUser);
        });

        UserPrincipal principal = new UserPrincipal(user);
        String token = jwtService.generateToken(principal, Map.of(
                "roles", user.getRoles(),
                "name", user.getName(),
                "userId", user.getId()
        ));

        return buildAuthResponse(user, token);
    }

    public User getCurrentUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof UserPrincipal userPrincipal) {
            return userRepository.findById(userPrincipal.getId())
                    .orElseThrow(() -> new IllegalStateException("Current user not found"));
        }
        throw new IllegalStateException("No authenticated user in security context");
    }

    private AuthResponse buildAuthResponse(User user, String token) {
        return AuthResponse.builder()
                .token(token)
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .roles(user.getRoles())
                .department(user.getDepartment())
                .officeLocation(user.getOfficeLocation())
                .avatarUrl(user.getAvatarUrl())
                .karmaPoints(user.getKarmaPoints())
                .walletBalance(user.getWalletBalance())
                .build();
    }
}
