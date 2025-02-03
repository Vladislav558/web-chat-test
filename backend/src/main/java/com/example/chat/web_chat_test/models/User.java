package com.example.chat.web_chat_test.models;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = true)
    private String password;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private AuthProvider authProvider;

    @Column(nullable = true)
    private String verificationCode;

    @Column(nullable = false)
    private boolean verified = false;

    @Column(nullable = false)
    private String firstName;
    
    @Column(nullable = true)
    private String lastName;

    @Column(nullable = true)
    private String profilePicture;
}
