package com.example.chat.web_chat_test.service.chat;

import com.example.chat.web_chat_test.models.dto.OnlineUserRequest;
import com.example.chat.web_chat_test.service.auth.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class WebSocketSessionService {

    private final Set<Long> onlineUsers = ConcurrentHashMap.newKeySet();
    private final AuthService authService;

    @Lazy
    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    public WebSocketSessionService(AuthService authService) {
        this.authService = authService;
    }

    public void addUser(Long userId) {
        onlineUsers.add(userId);
        broadcastOnlineUsers();
    }

    public void removeUser(Long userId) {
        onlineUsers.remove(userId);
        broadcastOnlineUsers();
    }

    public Set<Long> getOnlineUserIds() {
        return onlineUsers;
    }

    public void broadcastOnlineUsers() {
        List<OnlineUserRequest> users = authService.findUsersByIds(onlineUsers);
        messagingTemplate.convertAndSend("/topic/onlineUsers", users);
    }
}
