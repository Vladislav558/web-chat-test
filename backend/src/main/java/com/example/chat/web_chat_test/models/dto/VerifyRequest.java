package com.example.chat.web_chat_test.models.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class VerifyRequest {
    @Schema(description = "User email", example = "user@example.com", required = true)
    private String email;

    @Schema(description = "Verification code", example = "123456", required = true)
    private String code;

    @Schema(description = "Remember me on this device", example = "true", required = false)
    private boolean rememberMe;
}
