import { useEffect } from "react";
import { io } from "socket.io-client";

export type SocketNotification = {
  id: string;
  articleId: string;
  title: string;
  price: number;
  categoryId: string;
  created_at: string;
};

export interface LiveNotification {
  message: string | undefined;
  type: string;
  id: string;
  title: string;
  article_id: string;
  is_read: false;
  created_at: string;
}

export function useArticleNotifications(
  onNotif: (notif: LiveNotification) => void
) {
  useEffect(() => {
    const socket = io("http://localhost:4000", {
      transports: ["websocket"],
      auth: {
        token: localStorage.getItem("UserToken"),
      },
    });

    socket.on("connect", () => {
      console.log("WS Article connecté !");
    });

    socket.on("new_article_interest", (notif: SocketNotification) => {
      console.log("🆕 Nouvelle notif article :", notif);

      onNotif({
        id: notif.id,
        title: notif.title,
        article_id: notif.articleId,
        is_read: false,
        created_at: notif.created_at,
        message: undefined,
        type: "",
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [onNotif]);
}
