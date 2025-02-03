package com.example.chat.web_chat_test.repositories;

import com.example.chat.web_chat_test.models.Message;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {

    @Query("SELECT m FROM Message m WHERE (:lastMessageId IS NULL OR m.id < :lastMessageId) ORDER BY m.timestamp DESC")
    List<Message> findPaginated(@Param("lastMessageId") Long lastMessageId, Pageable pageable);
}
