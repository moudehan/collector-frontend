import { useEffect } from "react";
import { io } from "socket.io-client";
const API_URL = import.meta.env.VITE_API_URL;

export interface LiveNotification {
  id: string;
  type: string;
  title: string;
  message?: string;
  article_id: string;
  is_read: false;
  created_at: string;
}

export function useArticleNotifications(
  onNotif: (notif: LiveNotification) => void
) {
  useEffect(() => {
    const socket = io(API_URL, {
      transports: ["websocket"],
      auth: {
        token: localStorage.getItem("UserToken"),
      },
    });

    socket.on("connect", () => {
      console.log("WS Article connecté !");
    });

    socket.on("new_article_interest", (notif: LiveNotification) => {
      console.log("Nouvelle notif article :", notif);

      onNotif(notif);
    });

    return () => {
      socket.disconnect();
    };
  }, [onNotif]);
}
