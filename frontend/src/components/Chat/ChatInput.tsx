import React, { useState } from "react";
import styles from "./ChatInput.module.scss";
import { TextField, IconButton } from "@mui/material";
import { FaArrowRight } from "react-icons/fa";
import { ChatInputProps } from "@/types/ui";

const MAX_LENGTH = 5000;

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isSticky }) => {
  const [message, setMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value.length <= MAX_LENGTH) {
      setMessage(e.target.value);
    }
  };

  const handleSend = () => {
    if (message.trim() && message.length <= MAX_LENGTH) {
      onSendMessage(message);
      setMessage("");
    }
  };

  const isOverLimit = message.length > MAX_LENGTH;

  return (
    <div className={`${styles.chatInput} ${isSticky ? styles.sticky : ""}`}>
      <TextField
        fullWidth
        placeholder="Введите сообщение..."
        variant="outlined"
        value={message}
        autoComplete="off"
        onChange={handleChange}
        onKeyDown={(e) => e.key === "Enter" && !isOverLimit && handleSend()}
        error={isOverLimit}
        style={{ width: "100%", paddingLeft: "20px" }}
        sx={{
          "& .MuiOutlinedInput-root": {
            color: "white",
            backgroundColor: isOverLimit ? "#7f1d1d" : "#252525",
            borderRadius: "8px",
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: "var(--primary-color)",
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: isOverLimit ? "red" : "var(--primary-color)",
            },
          },
          "& .MuiInputLabel-root": { color: "#aaaaaa" },
          "& .MuiOutlinedInput-notchedOutline": { borderColor: isOverLimit ? "red" : "#666" },
          "& input": {
            WebkitBoxShadow: "0 0 0px 1000px #252525 inset !important",
            WebkitTextFillColor: "white !important",
            caretColor: "white",
          },
        }}
      />
      <div className={styles.actionsContainer}>
        <span className={styles.charCount} style={{ color: isOverLimit ? "red" : "white" }}>
          {message.length}/{MAX_LENGTH}
        </span>
        <IconButton
          onClick={handleSend}
          disabled={isOverLimit}
          className={styles.sendButton}
        >
          <FaArrowRight />
        </IconButton>
      </div>
    </div>
  );
};

export default ChatInput;
