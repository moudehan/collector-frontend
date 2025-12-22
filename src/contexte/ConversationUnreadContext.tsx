/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { io, type Socket } from "socket.io-client";
import {
  getMyConversations,
  markConversationAsUnread,
} from "../services/conversation.api";
import type { Conversation } from "../types/conversation.type";
import { useAuth } from "./UseAuth";
const API_URL = import.meta.env.VITE_API_URL;

type ConversationSummary = Conversation & {
  hasUnread?: boolean;
  unreadCount?: number;
};

type ConversationUnreadContextValue = {
  unreadCount: number;
  refreshUnread: () => Promise<void>;
};

const ConversationUnreadContext = createContext<
  ConversationUnreadContextValue | undefined
>(undefined);

function computeUnread(convs: ConversationSummary[]): number {
  return convs.filter((c) => c.hasUnread || (c.unreadCount ?? 0) > 0).length;
}

export function ConversationUnreadProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const socketRef = useRef<Socket | null>(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  async function refreshUnread() {
    if (!user) return;
    try {
      const allConvs = (await getMyConversations()) as ConversationSummary[];
      setUnreadCount(computeUnread(allConvs));
    } catch (e) {
      console.error("[UnreadContext] Erreur getMyConversations (refresh):", e);
    }
  }

  useEffect(() => {
    if (!user) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setUnreadCount(0);
      return;
    }

    const token = localStorage.getItem("UserToken");

    if (!token) {
      console.warn(
        "[UnreadContext] Aucun token trouvé alors qu'un user est présent"
      );
      return;
    }

    const socket = io(API_URL, {
      transports: ["websocket"],
      auth: {
        token: `Bearer ${token}`,
      },
    });
    socketRef.current = socket;

    (async () => {
      try {
        const allConvs = (await getMyConversations()) as ConversationSummary[];

        setUnreadCount(computeUnread(allConvs));

        allConvs.forEach((c) => {
          if (c.id) {
            socket.emit("joinConversation", { conversationId: c.id });
          }
        });
      } catch (e) {
        console.error("[UnreadContext] Erreur init getMyConversations:", e);
      }
    })();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleNewMessage = async (msg: any) => {
      if (msg?.senderId === user.id) return;

      const convId: string | null =
        msg.conversationId ??
        (typeof msg.conversation === "string"
          ? msg.conversation
          : msg.conversation?.id) ??
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (msg as any).conversation_id ??
        null;

      if (!convId) {
        console.warn(
          "[UnreadContext] newMessage sans conversationId exploitable",
          msg
        );
        return;
      }

      try {
        await markConversationAsUnread(convId);
      } catch (e) {
        console.error("[UnreadContext] Erreur markConversationAsUnread:", e);
      }

      await refreshUnread();
    };

    socket.on("newMessage", handleNewMessage);

    socket.on("connect_error", (err) => {
      console.error("[UnreadContext] Socket connect_error:", err);
    });

    return () => {
      socket.off("newMessage", handleNewMessage);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [refreshUnread, user]);

  const value: ConversationUnreadContextValue = {
    unreadCount,
    refreshUnread,
  };

  return (
    <ConversationUnreadContext.Provider value={value}>
      {children}
    </ConversationUnreadContext.Provider>
  );
}

export function useConversationUnread(): ConversationUnreadContextValue {
  const ctx = useContext(ConversationUnreadContext);
  if (!ctx) {
    throw new Error(
      "useConversationUnread doit être utilisé à l'intérieur de <ConversationUnreadProvider>"
    );
  }
  return ctx;
}
