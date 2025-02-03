package com.example.chat.web_chat_test.models.dto;

import com.example.chat.web_chat_test.models.Message;
import lombok.Getter;

@Getter
public class MessageRequest {
    private final Long id;
    private final Long senderId;
    private final String senderName;
    private final String content;
    private final String timestamp;
    private final String updatedTimestamp;
    private final String profilePicture;


    public MessageRequest(Message message) {
        this.id = message.getId();
        this.senderId = message.getSender() != null ? message.getSender().getId() : null;
        this.senderName = message.getSenderName();
        this.content = message.getContent();
        this.timestamp = message.getTimestamp().toString();
        this.updatedTimestamp = message.getUpdatedTimestamp() != null ? message.getUpdatedTimestamp().toString() : null;
        this.profilePicture = message.getSender() != null ? message.getSender().getProfilePicture() : null;
    }
}