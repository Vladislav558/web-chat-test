import { NavigateFunction } from "react-router-dom";
import { User } from "./auth";

export interface Message {
    id: string;
    senderId: string;
    senderName: string;
    content: string;
    timestamp: string;
    updatedTimestamp?: string;
    deletedForAll: boolean;
    deletedByUserIds: string[];
    profilePicture: string | null;
}

export interface MessageDeleteRequest {
  id: string;
  senderId: string;
  forAll: boolean;
  deletedForUserIds: string[];
}

export interface WebSocketMessage {
  type: "MESSAGE" | "EDIT" ;
  payload: Message;
}

export interface WebSocketDeleteMessage {
  type: "DELETE";
  payload: MessageDeleteRequest;
}

export interface OnlineUser {
  id: number;
  firstName: string;
  lastName: string;
  profilePicture: string | null;
}

export interface ChatStore {
  messages: Message[];
  onlineUsers: OnlineUser[];

  sendMessage: (content: string, user: User) => void;
  editMessage: (id: string, newContent: string) => void;
  deleteMessage: (id: string, forAll: boolean) => void;

  loadHistory: () => Promise<void>;
  loadOnlineUsers: () => Promise<void>;

  connectWebSocket: (navigate: NavigateFunction) => void;
  disconnectWebSocket: () => void;
}
