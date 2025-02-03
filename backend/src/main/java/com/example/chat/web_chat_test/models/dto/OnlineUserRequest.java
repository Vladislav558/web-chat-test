package com.example.chat.web_chat_test.models.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class OnlineUserRequest {
    private Long id;
    private String firstName;
    private String lastName;
    private String profilePicture;
}
