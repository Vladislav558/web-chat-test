package com.example.chat.web_chat_test.controllers.api.auth;

import com.example.chat.web_chat_test.models.dto.LoginRequest;
import com.example.chat.web_chat_test.models.dto.RegisterRequest;
import com.example.chat.web_chat_test.models.dto.VerifyRequest;
import com.example.chat.web_chat_test.models.User;
import com.example.chat.web_chat_test.service.auth.AuthService;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication", description = "Endpoints for user authentication")
public class AuthControllerRest {
    private static final Logger logger = LoggerFactory.getLogger(AuthControllerRest.class);
    
    private final AuthService authService;

    public AuthControllerRest(AuthService authService) {
        this.authService = authService;
    }

    @Operation(summary = "Register a new user", description = "Sends a verification code to the user's email.")
    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@RequestBody RegisterRequest request) {
        if (request.getEmail() == null || request.getEmail().isEmpty() || 
            request.getPassword() == null || request.getFirstName() == null || 
            request.getFirstName().isEmpty()) {
            
            return ResponseEntity.badRequest().body(Map.of(
                "status", "error",
                "message", "Email, password, and first name are required!"
            ));
        }
    
        try {
            authService.registerUser(
                request.getEmail(),
                request.getPassword(),
                request.getFirstName(),
                request.getLastName()
            );
            return ResponseEntity.ok(Map.of(
                "status", "success",
                "message", "Verification code sent to email."
            ));
        } catch (Exception e) {
            logger.error("Error during registration", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "status", "error",
                "message", "Registration failed.",
                "details", e.getMessage()
            ));
        }
    }

    @Operation(summary = "Verify user email", description = "Checks verification code and issues JWT tokens.")
    @PostMapping("/verify")
    public ResponseEntity<Map<String, Object>> verify(@RequestBody VerifyRequest request, HttpServletResponse response) {
        if (request.getEmail() == null || request.getCode() == null) {
            return ResponseEntity.badRequest().body(Map.of(
                "status", "error",
                "message", "Email and verification code are required!"
            ));
        }

        try {
            Map<String, String> tokens = authService.verifyUser(request.getEmail(), request.getCode(), request.isRememberMe());

            setTokenCookies(response, tokens, request.isRememberMe());
            return ResponseEntity.ok(Map.of(
                "status", "success",
                "message", "User verified successfully.",
                "tokens", tokens
            ));
        } catch (Exception e) {
            logger.error("Error during verification", e);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                "status", "error",
                "message", "Invalid verification code."
            ));
        }
    }

    @Operation(summary = "Login user", description = "Issues JWT tokens if the user exists.")
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody LoginRequest request, HttpServletResponse response) {
        if (request.getEmail() == null || request.getEmail().isEmpty() || request.getPassword() == null) {
            return ResponseEntity.badRequest().body(Map.of(
                "status", "error",
                "message", "Email and password are required!"
            ));
        }

        try {
            Map<String, String> tokens = authService.loginUser(request.getEmail(), request.getPassword(), request.isRememberMe());

            setTokenCookies(response, tokens, request.isRememberMe());
            return ResponseEntity.ok(Map.of(
                "status", "success",
                "message", "Login successful.",
                "tokens", tokens
            ));
        } catch (Exception e) {
            logger.error("Error during login", e);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                "status", "error",
                "message", "Login failed."
            ));
        }
    }

    @Operation(summary = "Check authentication", description = "Validates the access token stored in cookies.")
    @GetMapping("/token")
    public ResponseEntity<Map<String, Object>> checkAuth(@CookieValue(name = "access_token", required = false) String accessToken) {
        Optional<User> user = authService.checkAuth(accessToken);
    
        if (user.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                "status", "error",
                "message", "Invalid or missing access token!"
            ));
        }
    
        return ResponseEntity.ok(Map.of(
            "status", "success",
            "message", "User authenticated successfully.",
            "data", Map.ofEntries(
                Map.entry("id", user.get().getId()),
                Map.entry("email", user.get().getEmail()),
                Map.entry("firstName", user.get().getFirstName()),
                Map.entry("lastName", Optional.ofNullable(user.get().getLastName()).orElse("")),
                Map.entry("profilePicture", Optional.ofNullable(user.get().getProfilePicture()).orElse(""))
            )
        ));        
    }

    @Operation(summary = "Logout user", description = "Clears JWT tokens from cookies.")
    @PostMapping("/logout")
    public ResponseEntity<Map<String, Object>> logout(HttpServletResponse response) {
        try {
            clearTokenCookies(response);
            return ResponseEntity.ok(Map.of(
                "status", "success",
                "message", "Logged out successfully."
            ));
        } catch (Exception e) {
            logger.error("Error during logout", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "status", "error",
                "message", "Logout failed."
            ));
        }
    }

    private void setTokenCookies(HttpServletResponse response, Map<String, String> tokens, boolean rememberMe) {
        int refreshExpiry = rememberMe ? Integer.MAX_VALUE : 60 * 60 * 24;
    
        Cookie refreshCookie = new Cookie("refresh_token", tokens.get("refresh_token"));
        refreshCookie.setHttpOnly(true);
        refreshCookie.setPath("/");
        refreshCookie.setSecure(false);
        refreshCookie.setMaxAge(refreshExpiry);
        
        response.addCookie(refreshCookie);
    
        Cookie accessCookie = new Cookie("access_token", tokens.get("access_token"));
        accessCookie.setHttpOnly(true);
        accessCookie.setPath("/");
        refreshCookie.setSecure(false);
        accessCookie.setMaxAge(60 * 60 * 24);
        response.addCookie(accessCookie);
    }

    private void clearTokenCookies(HttpServletResponse response) {
        Cookie accessCookie = new Cookie("access_token", null);
        Cookie refreshCookie = new Cookie("refresh_token", null);

        accessCookie.setHttpOnly(true);
        accessCookie.setPath("/");
        refreshCookie.setSecure(false);
        accessCookie.setMaxAge(0);

        refreshCookie.setHttpOnly(true);
        refreshCookie.setPath("/");
        refreshCookie.setSecure(false);
        refreshCookie.setMaxAge(0);

        response.addCookie(accessCookie);
        response.addCookie(refreshCookie);
    }
}
