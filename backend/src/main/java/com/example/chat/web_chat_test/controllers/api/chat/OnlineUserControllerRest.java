package com.example.chat.web_chat_test.controllers.api.chat;

import com.example.chat.web_chat_test.models.dto.OnlineUserRequest;
import com.example.chat.web_chat_test.service.auth.AuthService;
import com.example.chat.web_chat_test.service.chat.WebSocketSessionService;

import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/users")
public class OnlineUserControllerRest {

    private final WebSocketSessionService sessionService;
    private final AuthService authService;

    public OnlineUserControllerRest(WebSocketSessionService sessionService, AuthService authService) {
        this.sessionService = sessionService;
        this.authService = authService;
    }

    @GetMapping("/online")
    public List<OnlineUserRequest> getOnlineUsers() {
        Set<Long> onlineUserIds = sessionService.getOnlineUserIds();
        return authService.findUsersByIds(onlineUserIds);
    }
}
