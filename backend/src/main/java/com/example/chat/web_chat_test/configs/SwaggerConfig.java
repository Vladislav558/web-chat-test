package com.example.chat.web_chat_test.configs;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Info;
import org.springframework.context.annotation.Configuration;

@Configuration
@OpenAPIDefinition(
        info = @Info(title = "Chat API", version = "1.0", description = "Documentation API for chat")
)
public class SwaggerConfig {
}