package com.example.chat.web_chat_test.controllers.api.chat;

import com.example.chat.web_chat_test.models.dto.MessageRequest;
import com.example.chat.web_chat_test.service.chat.MessageService;
import com.example.chat.web_chat_test.models.User;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chat")
public class ChatControllerRest {

    private final MessageService messageService;

    public ChatControllerRest(MessageService messageService) {
        this.messageService = messageService;
    }

    @GetMapping("/history")
    public List<MessageRequest> getHistory(
            @RequestParam Long userId, 
            @RequestParam(required = false) Long lastMessageId, 
            @RequestParam(defaultValue = "50") int limit) {
        User user = new User();
        user.setId(userId);
        return messageService.getHistory(user, lastMessageId, limit);
    }
}
