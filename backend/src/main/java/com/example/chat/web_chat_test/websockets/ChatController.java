package com.example.chat.web_chat_test.websockets;

import com.example.chat.web_chat_test.models.Message;
import com.example.chat.web_chat_test.models.User;
import com.example.chat.web_chat_test.models.dto.EditMessageRequest;
import com.example.chat.web_chat_test.models.dto.MessageRequest;
import com.example.chat.web_chat_test.service.chat.MessageService;
import com.example.chat.web_chat_test.models.dto.MessageDeleteRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.handler.annotation.*;
import org.springframework.stereotype.Controller;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Controller
public class ChatController {

    private final MessageService messageService;
    private final SimpMessagingTemplate messagingTemplate;

    private final Map<Long, Instant> lastMessageTimestamps = new ConcurrentHashMap<>();
    private final Map<Long, Instant> lastEditTimestamps = new ConcurrentHashMap<>();
    private final Map<Long, Instant> lastDeleteTimestamps = new ConcurrentHashMap<>();

    @Autowired
    public ChatController(MessageService messageService, SimpMessagingTemplate messagingTemplate) {
        this.messageService = messageService;
        this.messagingTemplate = messagingTemplate;
    }

    @MessageMapping("/chat.sendMessage")
    public void sendMessage(@Payload Map<String, Object> payload) {
        Long userId = Long.parseLong(payload.get("userId").toString());
        String content = (String) payload.get("content");

        if (content == null || content.trim().isEmpty()) {
            return;
        }

        Instant now = Instant.now();
        lastMessageTimestamps.putIfAbsent(userId, Instant.EPOCH);

        if (lastMessageTimestamps.get(userId).plusMillis(500).isAfter(now)) {
            return;
        }
        lastMessageTimestamps.put(userId, now);

        Message savedMessage = messageService.saveMessage(userId, content);
        MessageRequest messageRequest = new MessageRequest(savedMessage);

        messagingTemplate.convertAndSend("/topic/public", Map.of(
            "type", "MESSAGE",
            "payload", messageRequest
        ));
    }

    @MessageMapping("/chat.editMessage")
    @Transactional
    public void editMessage(@Payload EditMessageRequest request) {
        Long userId = messageService.getMessageSenderId(request.getMessageId());
        Instant now = Instant.now();

        lastEditTimestamps.putIfAbsent(userId, Instant.EPOCH);

        if (lastEditTimestamps.get(userId).plusMillis(500).isAfter(now)) {
            return;
        }
        lastEditTimestamps.put(userId, now);

        Message updated = messageService.editMessage(request.getMessageId(), request.getNewContent());
        updated = messageService.fetchJoinDeletedByUsers(updated.getId());

        messagingTemplate.convertAndSend("/topic/public", Map.of(
            "type", "EDIT",
            "payload", updated
        ));
    }

    @MessageMapping("/chat.deleteMessage")
    @Transactional
    public Map<String, Object> deleteMessage(@Payload Long messageId,
                                             @Header("userId") Long userId,
                                             @Header("forAll") boolean forAll) {
        Instant now = Instant.now();
        lastDeleteTimestamps.putIfAbsent(userId, Instant.EPOCH);

        if (lastDeleteTimestamps.get(userId).plusMillis(500).isAfter(now)) {
            return null;
        }
        lastDeleteTimestamps.put(userId, now);

        User user = messageService.getUserById(userId);
        Set<Long> deletedForUserIds = messageService.deleteMessage(messageId, user, forAll);
        MessageDeleteRequest deleteRequest = new MessageDeleteRequest(messageId, userId, forAll, deletedForUserIds);

        messagingTemplate.convertAndSend("/topic/public", Map.of(
            "type", "DELETE",
            "payload", deleteRequest
        ));

        return Map.of(
            "type", "DELETE",
            "payload", deleteRequest
        );
    }
}
