import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import SendIcon from "@mui/icons-material/Send";
import {
  Avatar,
  Box,
  Card,
  Divider,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";

import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { io, Socket } from "socket.io-client";

import UserPageLayout from "../../layout/UserPageLayout";

import { getArticleById } from "../../services/articles.api";
import {
  getMyConversations,
  loadMessages,
  markConversationAsRead,
  markConversationAsUnread,
  sendFirstMessage,
  sendMessage,
} from "../../services/conversation.api";
import { getShopById } from "../../services/shop.api";

import { useAuth } from "../../contexte/UseAuth";

import { setUnreadCount } from "../../store/conversationUnreadStore";
import type { Article } from "../../types/article.type";
import type {
  Conversation,
  ConversationMessage,
} from "../../types/conversation.type";
import type { Shop } from "../../types/shop.type";

type ConversationMessageWithRelation = ConversationMessage & {
  conversationId?: string;
  conversation?: { id: string } | string;
};

type ConversationWithUI = Conversation & {
  hasUnread?: boolean;
  lastMessageAt?: string | null;
};

export default function ConversationPage() {
  const location = useLocation();

  const { articleId, shopId, sellerId } =
    (location.state as {
      articleId?: string;
      shopId?: string;
      sellerId?: string;
    }) || {};

  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const { user } = useAuth();

  const [conversations, setConversations] = useState<ConversationWithUI[]>([]);
  const [currentConversation, setCurrentConversation] =
    useState<ConversationWithUI | null>(null);
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [article, setArticle] = useState<Article | null>(null);
  const [shop, setShop] = useState<Shop | null>(null);
  const [articleTitlesById, setArticleTitlesById] = useState<
    Record<string, string>
  >({});
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);

  const currentConversationIdRef = useRef<string | null>(null);

  useEffect(() => {
    socketRef.current = io("http://localhost:4000", {
      transports: ["websocket"],
    });
    socketRef.current.on("connect", () => {});

    socketRef.current.on(
      "newMessage",
      (msg: ConversationMessageWithRelation) => {
        const openedConvId = currentConversationIdRef.current;
        const msgConversationId: string | null =
          msg.conversationId ??
          (typeof msg.conversation === "string"
            ? msg.conversation
            : msg.conversation?.id) ??
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (msg as any).conversation_id ??
          null;

        const isMine = msg.senderId === user?.id;

        setMessages((prev) => {
          if (!openedConvId) return prev;
          if (msgConversationId && msgConversationId !== openedConvId) {
            return prev;
          }
          if (prev.some((m) => m.id === msg.id)) {
            return prev;
          }
          return [...prev, msg];
        });

        if (!msgConversationId) {
          return;
        }

        setConversations((prev) => {
          if (prev.length === 0) return prev;

          const nowIso = new Date().toISOString();

          const updated = prev.map((c) => {
            if (c.id !== msgConversationId) return c;

            if (!isMine) {
              return {
                ...c,
                hasUnread: true,
                lastMessageAt: nowIso,
              };
            }

            return {
              ...c,
              lastMessageAt: nowIso,
            };
          });

          const sorted = [...updated].sort((a, b) => {
            const aTime = a.lastMessageAt ? Date.parse(a.lastMessageAt) : 0;
            const bTime = b.lastMessageAt ? Date.parse(b.lastMessageAt) : 0;
            return bTime - aTime;
          });
          const unread = sorted.filter((c) => c.hasUnread).length;
          setUnreadCount(unread);

          return sorted;
        });

        if (!isMine && msgConversationId) {
          markConversationAsUnread(msgConversationId).catch((e) => {
            console.error("Erreur markConversationAsUnread:", e);
          });
        }
      }
    );
    socketRef.current.on("disconnect", () => {});

    return () => {
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, [user?.id]);

  useEffect(() => {
    currentConversationIdRef.current = currentConversation?.id ?? null;
  }, [currentConversation]);

  useEffect(() => {
    if (!socketRef.current) return;
    if (conversations.length === 0) return;

    conversations.forEach((c) => {
      socketRef.current?.emit("joinConversation", {
        conversationId: c.id,
      });
    });
  }, [conversations]);

  useEffect(() => {
    async function init() {
      try {
        setLoading(true);

        const allConvs = await getMyConversations();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const allConvsWithUI: ConversationWithUI[] = allConvs.map((c: any) => ({
          ...c,
          hasUnread: !!(c.hasUnread || c.unreadCount > 0),
          lastMessageAt: c.lastMessageAt ?? null,
        }));
        setConversations(allConvsWithUI);
        const initialUnread = allConvsWithUI.filter((c) => c.hasUnread).length;
        setUnreadCount(initialUnread);

        let initialConv: ConversationWithUI | null = null;

        if (articleId) {
          initialConv =
            allConvsWithUI.find((c) => c.articleId === articleId) ?? null;
        }

        if (!initialConv && allConvsWithUI.length > 0) {
          initialConv = allConvsWithUI[0];
        }

        if (initialConv) {
          setCurrentConversation(initialConv);

          const convMessages = await loadMessages(initialConv.id);
          setMessages(convMessages);

          const art = await getArticleById(initialConv.articleId);
          const shp = await getShopById(initialConv.shopId);
          setArticle(art);
          setShop(shp);
        } else {
          if (articleId) {
            setArticle(await getArticleById(articleId));
          }
          if (shopId) {
            setShop(await getShopById(shopId));
          }
        }

        const titles: Record<string, string> = {};
        await Promise.all(
          allConvsWithUI.map(async (c) => {
            if (!titles[c.articleId]) {
              const a = await getArticleById(c.articleId);
              titles[c.articleId] = a.title;
            }
          })
        );
        setArticleTitlesById(titles);
      } catch (e) {
        console.error("Erreur pendant l'init:", e);
      } finally {
        setLoading(false);
      }
    }

    init();
  }, [articleId, shopId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    if (!content.trim()) return;

    if (!currentConversation && articleId && shopId && sellerId) {
      const firstMsg = await sendFirstMessage({
        articleId,
        shopId,
        sellerId,
        content,
      });

      const newConv: ConversationWithUI = {
        ...firstMsg.conversation,
        hasUnread: false,
        lastMessageAt: new Date().toISOString(),
      };

      setCurrentConversation(newConv);
      setConversations((prev) => {
        const next = [newConv, ...prev];
        const unread = next.filter((c) => c.hasUnread).length;
        setUnreadCount(unread);

        return next;
      });

      try {
        setArticle(await getArticleById(newConv.articleId));
        setShop(await getShopById(newConv.shopId));
      } catch (e) {
        console.error("Erreur chargement article/shop après création conv:", e);
      }

      setContent("");
      return;
    }

    if (currentConversation) {
      await sendMessage(currentConversation.id, content);

      setConversations((prev) => {
        const next = prev.map((c) =>
          c.id === currentConversation.id
            ? {
                ...c,
                hasUnread: false,
                lastMessageAt: new Date().toISOString(),
              }
            : c
        );

        const unread = next.filter((c) => c.hasUnread).length;
        setUnreadCount(unread);

        return next;
      });

      setContent("");
    }
  }

  if (loading) {
    return (
      <UserPageLayout>
        <Typography p={4}>Chargement…</Typography>
      </UserPageLayout>
    );
  }

  const isOwner = article && user && article.seller.id === user.id;

  return (
    <UserPageLayout>
      <Box
        sx={{
          display: "flex",
          height: "calc(100vh - 160px)",
          p: 2,
          gap: 2,
        }}
      >
        <Card sx={{ width: 280, p: 2 }}>
          <Typography fontWeight={900} mb={2}>
            Conversations
          </Typography>

          {conversations.map((c) => (
            <Box
              key={c.id}
              onClick={async () => {
                setCurrentConversation(c);
                const convMessages = await loadMessages(c.id);
                setMessages(convMessages);

                const art = await getArticleById(c.articleId);
                const shp = await getShopById(c.shopId);
                setArticle(art);
                setShop(shp);

                try {
                  await markConversationAsRead(c.id);
                } catch (e) {
                  console.error("Erreur markConversationAsRead:", e);
                }

                setConversations((prev) => {
                  const next = prev.map((conv) =>
                    conv.id === c.id ? { ...conv, hasUnread: false } : conv
                  );
                  const unread = next.filter((conv) => conv.hasUnread).length;
                  setUnreadCount(unread);

                  return next;
                });
              }}
              sx={{
                p: 1.2,
                mb: 1,
                borderRadius: 2,
                cursor: "pointer",
                position: "relative",
                background:
                  currentConversation?.id === c.id
                    ? "#E9F1FF"
                    : c.hasUnread
                    ? "#E3F2FD"
                    : "#F5F5F5",
                border: c.hasUnread ? "1px solid #1E88E5" : "none",
              }}
            >
              <Typography
                fontWeight={c.hasUnread ? 900 : 700}
                fontSize={14}
                color={c.hasUnread ? "#1E4FFF" : "inherit"}
              >
                Article : {articleTitlesById[c.articleId] ?? "…"}
              </Typography>

              <Typography fontSize={12} color="gray">
                Conversation ID : {c.id}
              </Typography>

              {c.hasUnread && (
                <>
                  <Typography
                    fontSize={11}
                    color="#1E4FFF"
                    fontWeight={800}
                    sx={{ mt: 0.5 }}
                  >
                    Nouveau message en attente
                  </Typography>
                  <Box
                    sx={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      backgroundColor: "#1E4FFF",
                    }}
                  />
                </>
              )}
            </Box>
          ))}
        </Card>

        <Card sx={{ flex: 1, display: "flex", flexDirection: "column", p: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <IconButton onClick={() => navigate(-1)}>
              <ArrowBackIosNewIcon />
            </IconButton>
            <Avatar sx={{ ml: 1, mr: 2 }}>V</Avatar>
            <Typography fontWeight={800}>
              {currentConversation ? "Conversation" : "Nouveau message"}
            </Typography>
          </Box>

          <Divider />

          <Box sx={{ flex: 1, overflowY: "auto", mt: 2 }}>
            {messages.map((m) => {
              const isMine = m.senderId === user?.id;

              return (
                <Box
                  key={m.id}
                  sx={{
                    display: "flex",
                    justifyContent: isMine ? "flex-end" : "flex-start",
                    mb: 1,
                  }}
                >
                  <Box
                    sx={{
                      maxWidth: "70%",
                      p: 1.2,
                      borderRadius: 2,
                      background: isMine ? "#4C73FF" : "#ECECEC",
                      color: isMine ? "#fff" : "#000",
                    }}
                  >
                    {m.content}
                  </Box>
                </Box>
              );
            })}
            <div ref={messagesEndRef} />
          </Box>

          <Box sx={{ display: "flex", mt: 2 }}>
            <TextField
              fullWidth
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Écrire un message…"
            />
            <IconButton onClick={handleSend}>
              <SendIcon />
            </IconButton>
          </Box>
        </Card>

        <Card
          sx={{
            width: 320,
            p: 2,
            display: "flex",
            flexDirection: "column",
            gap: 2,
            overflowY: "auto",
          }}
        >
          {article && (
            <>
              <Typography fontWeight={900} fontSize={18}>
                Article
              </Typography>

              {article.images?.[0] && (
                <Box
                  sx={{
                    height: 180,
                    borderRadius: 2,
                    backgroundImage: `url(${article.images[0]})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                />
              )}

              <Typography fontWeight={700}>{article.title}</Typography>

              <Typography fontSize={14} color="gray">
                {article.description}
              </Typography>

              <Typography fontWeight={900} fontSize={22} color="#4C73FF">
                {article.price} €
              </Typography>

              <Box
                onClick={() =>
                  navigate(
                    isOwner
                      ? `/article/${article.id}`
                      : `/article/detail/${article.id}`
                  )
                }
                sx={{
                  p: 1.2,
                  borderRadius: 2,
                  textAlign: "center",
                  cursor: "pointer",
                  backgroundColor: "#E9F1FF",
                  fontWeight: 700,
                  color: "#1E4FFF",
                  "&:hover": { backgroundColor: "#DCE8FF" },
                }}
              >
                Voir l’article
              </Box>
            </>
          )}

          <Divider />

          {shop && (
            <>
              <Typography fontWeight={900}>Boutique</Typography>
              <Typography fontWeight={700}>{shop.name}</Typography>
              {shop.description && (
                <Typography fontSize={14} color="gray">
                  {shop.description}
                </Typography>
              )}
            </>
          )}
        </Card>
      </Box>
    </UserPageLayout>
  );
}
