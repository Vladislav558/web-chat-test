import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Chat.module.scss";
import ChatMessages from "./ChatMessages";
import ChatHeader from "./ChatHeader";
import ChatInput from "./ChatInput";
import { useChatStore } from "@/stores/chatStore";
import { useAuth } from "@/stores/useAuth";

const generateCurrentUser = (user: any) => ({
  id: user.id,
  name: user.lastName ? `${user.firstName} ${user.lastName}` : user.firstName,
  avatar: user.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.firstName[0] + (user.lastName ? user.lastName[0] : ""))}&background=random&color=fff&bold=true`,
  isOnline: true,
});

const Chat: React.FC = () => {
  const navigate = useNavigate();
  const {
    messages, 
    sendMessage, 
    editMessage, 
    deleteMessage, 
    connectWebSocket, 
    disconnectWebSocket, 
    loadHistory,
    loadOnlineUsers,
    onlineUsers
  } = useChatStore();
  
  const { user, isLoading } = useAuth();
  const chatRef = useRef<HTMLDivElement | null>(null);
  const [isSticky, setIsSticky] = React.useState(false);
  const [showScrollButton, setShowScrollButton] = React.useState(false);
  const [selectedMessage, setSelectedMessage] = React.useState<string | null>(null);
  const [menuPosition, setMenuPosition] = React.useState<{ top: number; left: number } | null>(null);

  useEffect(() => {
    console.log("useEffect is running");
    console.log("user:", user, "| isLoading:", isLoading);

    if (isLoading) {
      console.log("A user load is in progress...");
      return;
    }

    if (!user) {
      console.warn("User not found! Redirect to /auth...");
      navigate("/auth");
      return;
    }

    console.log("Loading the message history...");
    loadHistory();

    console.log("Connecting WebSocket...");
    connectWebSocket(navigate);

    console.log("Uploading online users...");
    loadOnlineUsers();

    return () => {
      console.log("Disabling WebSocket...");
      disconnectWebSocket();
    };
  }, [navigate, user, isLoading]);
  
  useEffect(() => {
    if (!chatRef.current) return;

    const handleScroll = () => {
      if (!chatRef.current) return;

      setShowScrollButton(
        chatRef.current.scrollTop < chatRef.current.scrollHeight - chatRef.current.clientHeight - 100
      );

      const isAtBottom =
        chatRef.current.scrollHeight - chatRef.current.scrollTop <= chatRef.current.clientHeight + 1;
      setIsSticky(!isAtBottom);

      setSelectedMessage(null);
      setMenuPosition(null);
    };

    chatRef.current.addEventListener("scroll", handleScroll);

    return () => {
      chatRef.current?.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleSendMessage = (text: string) => {
    if (!user) return;
  
    sendMessage(text, user);
  };

  return (
    <div className={styles.chat}>
      {user && <ChatHeader isSticky={!isSticky} users={onlineUsers} currentUser={generateCurrentUser(user)} />}
      <ChatMessages
        ref={chatRef}
        messages={messages}
        onEdit={editMessage}
        onDelete={deleteMessage}
        showScrollButton={showScrollButton}
        selectedMessage={selectedMessage}
        setSelectedMessage={setSelectedMessage}
        menuPosition={menuPosition}
        setMenuPosition={setMenuPosition}
      />
      <ChatInput onSendMessage={handleSendMessage} isSticky={isSticky} />
    </div>
  );
};

export default Chat;
