package com.example.chat.web_chat_test.controllers.api;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class HelloControllerRest {

    @GetMapping("/hello")
    public String hello() {
        return "Hello, Spring Boot is working!";
    }
}