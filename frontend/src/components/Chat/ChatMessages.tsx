import React, { useState, useEffect, useRef, forwardRef } from "react";
import { FaChevronDown, FaEdit } from "react-icons/fa";
import { TextField } from "@mui/material";
import styles from "./ChatMessages.module.scss";
import { ChatMessagesProps } from "@/types/ui";
import { useAuth } from "@/stores/useAuth";

const ChatMessages = forwardRef<HTMLDivElement, ChatMessagesProps>(
  ({ messages, onEdit, onDelete, showScrollButton, selectedMessage, setSelectedMessage, menuPosition, setMenuPosition }, chatRef) => {
    const { user } = useAuth();
    const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
    const [editText, setEditText] = useState("");
    const firstRender = useRef(true);
    const menuRef = useRef<HTMLDivElement | null>(null);
    const touchCoords = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

    useEffect(() => {
      if (!messages.some((m) => m.id === editingMessageId)) {
        setEditingMessageId(null);
      }
    }, [messages]);

    const formatTimestamp = (timestamp: string) => {
      return new Date(timestamp).toLocaleString("ru-RU", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    };

    const handleOpenMenu = (e: React.MouseEvent | React.TouchEvent, id: string) => {
      e.preventDefault();
      e.stopPropagation();

      if (selectedMessage === id) {
        setSelectedMessage(null);
        setMenuPosition(null);
        return;
      }

      setSelectedMessage(id);

      let clickX = "clientX" in e ? e.clientX : touchCoords.current.x;
      let clickY = "clientY" in e ? e.clientY : touchCoords.current.y;

      let left = clickX, top = clickY;

      if (left + 150 > window.innerWidth) left = window.innerWidth - 160;
      if (top + 100 > window.innerHeight) top = window.innerHeight - 110;

      setMenuPosition({ top, left });
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setSelectedMessage(null);
        setMenuPosition(null);
      }
    };

    useEffect(() => {
      document.addEventListener("click", handleClickOutside);
      return () => {
        document.removeEventListener("click", handleClickOutside);
      };
    }, []);

    const scrollToBottomInstant = () => {
      requestAnimationFrame(() => {
        (chatRef as React.RefObject<HTMLDivElement>)?.current?.scrollTo({
          top: (chatRef as React.RefObject<HTMLDivElement>)?.current?.scrollHeight,
          behavior: "auto",
        });
      });
    };

    useEffect(() => {
      if (firstRender.current) {
        firstRender.current = false;
      }
      scrollToBottomInstant();
    }, [messages.length]);

    const scrollToBottom = () => {
      (chatRef as React.RefObject<HTMLDivElement>)?.current?.scrollTo({
        top: (chatRef as React.RefObject<HTMLDivElement>)?.current?.scrollHeight,
        behavior: "smooth",
      });
    };

    const handleCopy = (content: string) => {
      navigator.clipboard.writeText(content);
      setSelectedMessage(null);
    };

    const startEditing = (id: string, content: string) => {
      setEditingMessageId(id);
      setEditText(content);
      setSelectedMessage(null);
    };

    const handleEditConfirm = (id: string) => {
      const originalText = messages.find((m) => m.id === id)?.content || "";
      
      if (editText.trim() && editText.trim() !== originalText.trim()) {
        onEdit(id, editText);
      }
    
      setEditingMessageId(null);
    };

    const handleDelete = (id: string, forAll: boolean) => {
      onDelete(id, forAll);
      setSelectedMessage(null);
    };

    return (
      <div className={styles.chatMessages} ref={chatRef}>
        {messages
          .filter((msg) => !msg.deletedForAll && !(msg.deletedByUserIds ?? []).includes(user?.id ?? ""))
          .map((msg) => (
            <div
              key={msg.id}
              className={`${styles.message} ${selectedMessage === msg.id ? styles.selected : ""}`}
              onClick={(e) => handleOpenMenu(e, msg.id)}
              onContextMenu={(e) => handleOpenMenu(e, msg.id)}
            >
              <img src={msg.profilePicture || `/avatars/default.jpg`} alt={msg.senderName} className={styles.avatar} />
              <div className={styles.content}>
                <div className={styles.header}>
                  <span className={styles.sender}>{msg.senderName}</span>
                  <div className={styles.detailsContainer}>
                    <span className={styles.timestamp}>{formatTimestamp(msg.timestamp)}</span>
                    {msg.updatedTimestamp && <FaEdit className={styles.editedIcon} title="Отредактировано" />}
                  </div>
                </div>
                {editingMessageId === msg.id ? (
                  <TextField
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    onBlur={() => handleEditConfirm(msg.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleEditConfirm(msg.id);
                      }
                    }}
                    autoFocus
                    fullWidth
                    variant="outlined"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        color: "white",
                        backgroundColor: "#252525",
                        borderRadius: "8px",
                        "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "var(--primary-color)" },
                        "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "var(--primary-color)" },
                      },
                      "& input": {
                        WebkitBoxShadow: "0 0 0px 1000px #252525 inset !important",
                        WebkitTextFillColor: "white !important",
                        caretColor: "white",
                      },
                    }}
                  />
                ) : (
                  <p className={styles.content}>{msg.content}</p>
                )}
              </div>
            </div>
          ))}

        {selectedMessage && menuPosition && (
          <div ref={menuRef} className={styles.menu} style={{ top: menuPosition.top, left: menuPosition.left }}>
            <span onClick={() => handleCopy(messages.find((m) => m.id === selectedMessage)?.content || "")}>Копировать</span>
            <span onClick={() => handleDelete(selectedMessage, false)}>Удалить у себя</span>
            {messages.find((m) => m.id === selectedMessage)?.senderId === user?.id && (
              <>
                <span onClick={() => handleDelete(selectedMessage, true)}>Удалить у всех</span>
                <span onClick={() => startEditing(selectedMessage, messages.find((m) => m.id === selectedMessage)?.content || "")}>
                  Редактировать
                </span>
              </>
            )}
          </div>
        )}

        {showScrollButton && (
          <button className={styles.scrollToBottom} onClick={scrollToBottom}>
            <FaChevronDown style={{ paddingTop: "2px" }} />
          </button>
        )}
      </div>
    );
  }
);

export default ChatMessages;
