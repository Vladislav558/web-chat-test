import { Client } from "@stomp/stompjs";
import axios from "axios";
import { NavigateFunction } from "react-router-dom";
import { User } from "@/types/auth";
import { OnlineUser } from "@/types/chat";

const SOCKET_URL = "ws://localhost:5000/ws";

const authenticateUser = async (): Promise<boolean> => {
  try {
    const response = await axios.post(
      "http://localhost:5000/ws/auth",
      {},
      { withCredentials: true }
    );

    if (response.data.status === "success") {
      console.log("WebSocket Auth OK:", response.data.user);
      return true;
    }

    console.error("WebSocket Auth failed:", response.data.message);
    return false;
  } catch (error) {
    console.error("Error during WebSocket Auth:", error);
    return false;
  }
};

let client: Client | null = null;

export const websocketService = {
  connect: async (onMessageReceived: (msg: any) => void, onOnlineUsersUpdate: (users: OnlineUser[]) => void, navigate: NavigateFunction) => {

    const isAuthenticated = await authenticateUser();
    if (!isAuthenticated) {
      navigate("/auth");
      return;
    }


    client = new Client({
      brokerURL: SOCKET_URL,
      debug: (str) => console.log(" WebSocket:", str),
      reconnectDelay: 5000,
      onConnect: () => {

        client?.subscribe("/topic/public", (message) => {
          onMessageReceived(JSON.parse(message.body));
        });

        client?.subscribe("/topic/onlineUsers", (message) => {
          onOnlineUsersUpdate(JSON.parse(message.body));
        });
      },
      onDisconnect: () => console.log("WebSocket disabled..."),
    });

    client.activate();
  },

  disconnect: () => {
    if (client) {
      client.deactivate();
      client = null;
      console.log("WebSocket disabled...");
    }
  },

  sendMessage: (content: string, user: User) => {
    if (!user) return;

    if (client && client.connected) {

      client.publish({
        destination: "/app/chat.sendMessage",
        body: JSON.stringify({
          userId: user.id,
          content: content,
        }),
      });
    } else {
      console.error("WebSocket is not connected!");
    }
  },

  editMessage: (messageId: string, newText: string) => {
    if (client && client.connected) {

      client.publish({
        destination: "/app/chat.editMessage",
        body: JSON.stringify({ messageId, newContent: newText }),
      });
    } else {
      console.error("WebSocket is not connected!");
    }
  },

  deleteMessage: (messageId: string, userId: string, forAll: boolean) => {
    if (client && client.connected) {

      client.publish({
        destination: "/app/chat.deleteMessage",
        headers: { userId, forAll: forAll.toString() },
        body: JSON.stringify(messageId),
      });
    } else {
      console.error("WebSocket is not connected!");
    }
  },
};
