import React from "react";
import styles from "./ChatPage.module.scss";
import Chat from "@/components/Chat/Chat";

const ChatPage: React.FC = () => {
  return (
    <div className={styles.chatPage}>
      <Chat />
    </div>
  );
};

export default ChatPage;
