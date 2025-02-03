import { Message, OnlineUser } from "@/types/chat";

export interface User {
    id: string;
    name: string;
    avatar: string;
    isOnline: boolean;
  }
  
  export interface ChatHeaderProps {
    isSticky: boolean;
    users: OnlineUser[];
    currentUser: User;
  }
  
  export interface ChatInputProps {
    onSendMessage: (message: string) => void;
    isSticky: boolean;
  }
  
  export interface ChatMessagesProps {
    messages: Message[];
    onEdit: (id: string, newText: string) => void;
    onDelete: (id: string, forAll: boolean) => void;
    showScrollButton: boolean;
    selectedMessage: string | null;
    setSelectedMessage: (id: string | null) => void;
    menuPosition: { top: number; left: number } | null;
    setMenuPosition: (pos: { top: number; left: number } | null) => void;
  }
  
  export interface MainProps {
    children?: React.ReactNode;
  }
  