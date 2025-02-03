package com.example.chat.web_chat_test.configs;

import com.example.chat.web_chat_test.security.SessionWebSocketInterceptor;
import com.example.chat.web_chat_test.service.chat.WebSocketSessionService;

import org.springframework.context.annotation.Configuration;
import org.springframework.lang.NonNull;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.*;

@Configuration  // ✅ Добавляем аннотацию, иначе Spring его не загрузит
@EnableWebSocketMessageBroker  // ✅ Разрешаем обработку WebSocket-сообщений
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private final WebSocketSessionService sessionService;

    public WebSocketConfig(WebSocketSessionService sessionService) {
        this.sessionService = sessionService;
    }

    @Override
    public void configureMessageBroker(@NonNull MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic");  // ✅ Клиенты подписываются на /topic/**
        config.setApplicationDestinationPrefixes("/app");  // ✅ Сообщения отправляются на /app/**
    }

    @Override
    public void registerStompEndpoints(@NonNull StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")  // ✅ Настраиваем точку входа WebSocket
                .addInterceptors(new SessionWebSocketInterceptor(sessionService))
                .setAllowedOriginPatterns("*");
    }
}
