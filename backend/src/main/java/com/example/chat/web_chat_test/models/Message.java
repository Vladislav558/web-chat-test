package com.example.chat.web_chat_test.models;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.Set; 
import java.util.HashSet;

@Entity
@Table(name = "messages")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class Message {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "sender_id", nullable = false)
    private User sender;

    private String senderName;

    @Column(columnDefinition = "TEXT")
    private String content;

    private LocalDateTime timestamp;

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "message_deleted_users", joinColumns = @JoinColumn(name = "message_id"))
    @Column(name = "user_id")
    private Set<Long> deletedByUserIds = new HashSet<>();

    private boolean deletedForAll;

    private LocalDateTime updatedTimestamp;

    @Transient
    private Long senderId;

    public void setSenderId() {
        this.senderId = sender != null ? sender.getId() : null;
    }
}
