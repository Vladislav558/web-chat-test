package com.example.chat.web_chat_test.websockets;

import org.springframework.messaging.simp.user.SimpUserRegistry;
import org.springframework.stereotype.Component;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import com.example.chat.web_chat_test.service.chat.WebSocketSessionService;

import java.util.Map;

@Component
public class WebSocketEventListener {

    private final WebSocketSessionService sessionService;
    private final SimpUserRegistry userRegistry;

    public WebSocketEventListener(WebSocketSessionService sessionService, SimpUserRegistry userRegistry) {
        this.sessionService = sessionService;
        this.userRegistry = userRegistry;
    }

    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());

        Map<String, Object> sessionAttributes = headerAccessor.getSessionAttributes();
        if (sessionAttributes == null) {
            return;
        }

        Long userId = (Long) sessionAttributes.get("userId");

        if (userId != null) {
            boolean isStillConnected = userRegistry.getUsers().stream()
                    .anyMatch(user -> user.getName().equals(String.valueOf(userId)));

            if (!isStillConnected) {
                sessionService.removeUser(userId);
            }
        }
    }
}
