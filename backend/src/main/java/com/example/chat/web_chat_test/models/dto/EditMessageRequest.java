package com.example.chat.web_chat_test.models.dto;

import lombok.Data;

@Data
public class EditMessageRequest {
    private Long messageId;
    private String newContent;
}
