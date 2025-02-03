package com.example.chat.web_chat_test.models.dto;

import java.util.Set;

public class MessageDeleteRequest {
    private Long id;
    private Long senderId;
    private boolean forAll;
    private Set<Long> deletedForUserIds;

    public MessageDeleteRequest(Long id, Long senderId, boolean forAll, Set<Long> deletedForUserIds) {
        this.id = id;
        this.senderId = senderId;
        this.forAll = forAll;
        this.deletedForUserIds = deletedForUserIds;
    }

    public Long getId() {
        return id;
    }

    public Long getSenderId() {
        return senderId;
    }

    public boolean isForAll() {
        return forAll;
    }

    public Set<Long> getDeletedForUserIds() {
        return deletedForUserIds;
    }
}