package com.example.chat.web_chat_test.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.lang.NonNull;
import org.springframework.lang.Nullable;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;
import com.example.chat.web_chat_test.service.chat.WebSocketSessionService;

import java.util.Map;

@Component
public class SessionWebSocketInterceptor implements HandshakeInterceptor {

    private final WebSocketSessionService sessionService;

    public SessionWebSocketInterceptor(WebSocketSessionService sessionService) {
        this.sessionService = sessionService;
    }

    @Override
    public boolean beforeHandshake(
            @NonNull ServerHttpRequest request,
            @NonNull org.springframework.http.server.ServerHttpResponse response,
            @NonNull WebSocketHandler wsHandler,
            @NonNull Map<String, Object> attributes) {

        if (request instanceof ServletServerHttpRequest servletRequest) {
            HttpServletRequest httpRequest = servletRequest.getServletRequest();
            HttpSession session = httpRequest.getSession(false);

            if (session != null && session.getAttribute("userId") != null) {
                Long userId = (Long) session.getAttribute("userId");
                attributes.put("userId", userId);
                session.setAttribute("userId", userId);

                sessionService.addUser(userId);
                return true;
            }
        }
        return false;
    }

    @Override
    public void afterHandshake(
            @NonNull ServerHttpRequest request,
            @NonNull org.springframework.http.server.ServerHttpResponse response,
            @NonNull WebSocketHandler wsHandler,
            @Nullable Exception exception) {
    }
}
