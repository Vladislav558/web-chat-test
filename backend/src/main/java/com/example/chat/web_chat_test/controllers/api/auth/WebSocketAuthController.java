package com.example.chat.web_chat_test.controllers.api.auth;

import com.example.chat.web_chat_test.models.User;
import com.example.chat.web_chat_test.service.auth.AuthService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/ws")
public class WebSocketAuthController {
    private final AuthService authService;

    public WebSocketAuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/auth")
    public ResponseEntity<Map<String, Object>> authenticateUser(HttpServletRequest request, HttpSession session) {
        String accessToken = null;

        if (request.getCookies() != null) {
            for (var cookie : request.getCookies()) {
                if ("access_token".equals(cookie.getName())) {
                    accessToken = cookie.getValue();
                }
            }
        }

        if (accessToken == null || accessToken.isEmpty()) {
            System.err.println("WebSocket Auth: No access token found in cookies!");
            return ResponseEntity.status(401).body(Map.of(
                "status", "error",
                "message", "Missing access token"
            ));
        }

        Optional<User> userOptional = authService.checkAuth(accessToken);

        if (userOptional.isPresent()) {
            User user = userOptional.get();

            session.setAttribute("userId", user.getId());

            return ResponseEntity.ok(Map.of(
                "status", "success",
                "message", "WebSocket Auth OK",
                "user", Map.of(
                    "id", user.getId()

                )
            ));
        }

        System.err.println("❌ WebSocket Auth failed: Invalid token!");
        return ResponseEntity.status(401).body(Map.of(
            "status", "error",
            "message", "Invalid token"
        ));
    }
}
