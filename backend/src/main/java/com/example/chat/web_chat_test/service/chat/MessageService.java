package com.example.chat.web_chat_test.service.chat;

import com.example.chat.web_chat_test.models.dto.MessageRequest;
import com.example.chat.web_chat_test.models.Message;
import com.example.chat.web_chat_test.models.User;
import com.example.chat.web_chat_test.repositories.MessageRepository;
import com.example.chat.web_chat_test.repositories.UserRepository;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class MessageService {

    @PersistenceContext
    private EntityManager entityManager;

    private final MessageRepository messageRepository;
    private final UserRepository userRepository;

    public MessageService(MessageRepository messageRepository, UserRepository userRepository) {
        this.messageRepository = messageRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public User getUserById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }


    @Transactional(readOnly = true)
    public List<MessageRequest> getHistory(User user, Long lastMessageId, int limit) {
        List<Message> messages = messageRepository.findPaginated(lastMessageId, PageRequest.of(0, limit, Sort.by("timestamp").descending()));
    
        return messages.stream()
                .filter(msg -> !msg.isDeletedForAll())
                .filter(msg -> msg.getDeletedByUserIds() == null || !msg.getDeletedByUserIds().contains(user.getId()))
                .map(MessageRequest::new)
                .collect(Collectors.toList());
    }
    
    @Transactional
    public Message saveMessage(Long userId, String content) {
        User sender = getUserById(userId);
        
        if (content.length() > 5000) {
            throw new IllegalArgumentException("Message content exceeds the maximum allowed length of 5000 characters.");
        }

        Message message = new Message();
        message.setSender(sender);
        message.setSenderName(sender.getFirstName() + " " + sender.getLastName());
        message.setContent(content);
        message.setTimestamp(LocalDateTime.now());
        message.setDeletedForAll(false);

        return messageRepository.save(message);
    }

    @Transactional
    public Message editMessage(Long messageId, String newContent) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found"));

        message.setContent(newContent);
        message.setUpdatedTimestamp(LocalDateTime.now());
        return messageRepository.save(message);
    }

    @Transactional
    public Message fetchJoinDeletedByUsers(Long messageId) {
        return entityManager.createQuery(
                "SELECT m FROM Message m LEFT JOIN FETCH m.deletedByUserIds WHERE m.id = :messageId", Message.class)
            .setParameter("messageId", messageId)
            .getSingleResult();
    }

    @Transactional(readOnly = true)
    public Long getMessageSenderId(Long messageId) {
        return messageRepository.findById(messageId)
                .map(message -> message.getSender().getId())
                .orElseThrow(() -> new RuntimeException("Message not found"));
    }

    @Transactional
    public Set<Long> deleteMessage(Long messageId, User user, boolean forAll) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found"));
    
        if (forAll) {
            message.setDeletedForAll(true);
            message.getDeletedByUserIds().clear();
        } else {
            message.getDeletedByUserIds().add(user.getId());
        }
    
        messageRepository.save(message);
        return message.getDeletedByUserIds();
    }
}
