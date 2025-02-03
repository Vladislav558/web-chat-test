package com.example.chat.web_chat_test.configs;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class EnvConfig {
    private static final Dotenv dotenv = Dotenv.configure()
            .directory("D:/Codes on Python/web-chat-test/backend")
            .ignoreIfMissing()
            .load();

    static {
        dotenv.entries().forEach(entry -> System.setProperty(entry.getKey(), entry.getValue()));
    }

    @Bean
    public String getDbUrl() {
        return dotenv.get("DB_URL");
    }

    @Bean
    public String getDbUsername() {
        return dotenv.get("DB_USERNAME");
    }

    @Bean
    public String getDbPassword() {
        return dotenv.get("DB_PASSWORD");
    }

    @Bean
    public String getVkClientId() {
        return dotenv.get("VK_CLIENT_ID");
    }

    @Bean
    public String getVkClientSecret() {
        return dotenv.get("VK_CLIENT_SECRET");
    }
}
