import { create } from "zustand";
import { websocketService } from "@/utils/websocket";
import { chatApi } from "@/api/chatApi";
import { useAuth } from "@/stores/useAuth";
import { Message, WebSocketMessage, WebSocketDeleteMessage, ChatStore, OnlineUser } from "@/types/chat";
import { User } from "@/types/auth";

const isWebSocketMessage = (msg: any): msg is WebSocketMessage => {
  return msg?.type === "MESSAGE" || msg?.type === "EDIT";
};

const isWebSocketDeleteMessage = (msg: any): msg is WebSocketDeleteMessage => {
  return msg?.type === "DELETE";
};

const generateUserName = (user: OnlineUser) => {
  return user.lastName ? `${user.firstName} ${user.lastName}` : user.firstName;
};

const generateUserAvatar = (user: OnlineUser) => {
  if (user.profilePicture) return user.profilePicture;

  const initials = user.firstName[0] + (user.lastName ? user.lastName[0] : "");
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=random&color=fff&bold=true`;
};

export const useChatStore = create<ChatStore>((set) => ({
  messages: [],
  onlineUsers: [],

  sendMessage: (content: string, user: User) => {
    websocketService.sendMessage(content, user);
  },

  editMessage: (id, newContent) => {
    websocketService.editMessage(id, newContent);
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg.id === id ? { ...msg, content: newContent, updatedTimestamp: new Date().toISOString() } : msg
      ),
    }));
  },

  deleteMessage: (id, forAll) => {
    const { user } = useAuth.getState();
    if (!user) return;
    websocketService.deleteMessage(id, user.id, forAll);

    set((state) => ({
      messages: state.messages.map((msg) =>
        msg.id === id
          ? { ...msg, deletedForAll: forAll, deletedByUserIds: [...(msg.deletedByUserIds ?? []), user.id] }
          : msg
      ),
    }));
  },

  loadHistory: async () => {
    const { user } = useAuth.getState();
    if (!user) return;

    try {
      const history: Message[] = await chatApi.loadHistory(user.id);

      set({
        messages: history.map((msg) => ({
          ...msg,
          deletedByUserIds: msg.deletedByUserIds ?? [],
        })),
      });
    } catch (error) {
      console.error("Error loading the message history:", error);
    }
  },

  loadOnlineUsers: async () => {
    try {
      const { user } = useAuth.getState();
      if (!user) return;

      const onlineUsers = await chatApi.loadOnlineUsers();

      if (!Array.isArray(onlineUsers) || onlineUsers.length === 0) {
        set({ onlineUsers: [] });
        return;
      }

      const processedUsers = onlineUsers
        .filter((u) => u.id !== user.id)
        .map((user: OnlineUser) => ({
          ...user,
          name: generateUserName(user),
          avatar: generateUserAvatar(user),
        }));

      console.log("Online users (excluding self):", processedUsers);
      set({ onlineUsers: processedUsers });
    } catch (error) {
      console.error("Error loading the list of online users:", error);
    }
  },

  connectWebSocket: (navigate) => {

    websocketService.connect(
      (msg: any) => {

        set((state) => {
          if (isWebSocketMessage(msg)) {
            const { payload } = msg;

            if (msg.type === "EDIT") {
              return {
                messages: state.messages.map((m) =>
                  m.id === payload.id
                    ? { ...m, content: payload.content, updatedTimestamp: payload.updatedTimestamp }
                    : m
                ),
              };
            }

            if (state.messages.some((m) => m.id === payload.id)) {
              return state;
            }

            return { messages: [...state.messages, payload] };
          } else if (isWebSocketDeleteMessage(msg)) {
            const { payload } = msg;

            return {
              messages: state.messages.map((m) =>
                m.id === payload.id
                  ? { ...m, deletedForAll: payload.forAll, deletedByUserIds: [...(m.deletedByUserIds ?? []), payload.senderId] }
                  : m
              ),
            };
          }

          return state;
        });
      },
      (onlineUsers: OnlineUser[]) => {
        const { user } = useAuth.getState();
        if (!user) return;
      
        const processedUsers = onlineUsers
          .filter((u) => String(u.id) !== String(user.id))
          .map((user) => ({
            ...user,
            name: generateUserName(user),
            avatar: generateUserAvatar(user),
          }));
      
        console.log("WebSocket Online users (excluding self):", processedUsers);
        set({ onlineUsers: processedUsers });
      },
      navigate
    );
  },

  disconnectWebSocket: () => {
    websocketService.disconnect();
  },
}));
