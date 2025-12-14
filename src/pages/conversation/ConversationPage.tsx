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
  sendFirstMessage,
  sendMessage,
} from "../../services/conversation.api";
import { getShopById } from "../../services/shop.api";

import { useAuth } from "../../contexte/UseAuth";

import type { Article } from "../../types/article.type";
import type {
  Conversation,
  ConversationMessage,
} from "../../types/conversation.type";
import type { Shop } from "../../types/shop.type";

type ConversationMessageWithRelation = ConversationMessage & {
  conversationId?: string;
  conversation?: { id: string };
};

type ConversationWithUI = Conversation & {
  hasUnread?: boolean;
  lastMessageAt?: number;
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

    socketRef.current.on(
      "newMessage",
      (msg: ConversationMessageWithRelation) => {
        const msgConversationId =
          msg.conversationId ?? msg.conversation?.id ?? null;

        setMessages((prev) => {
          if (!currentConversationIdRef.current) return prev;

          if (
            !msgConversationId ||
            msgConversationId !== currentConversationIdRef.current
          ) {
            return prev;
          }

          if (prev.some((m) => m.id === msg.id)) return prev;
          return [...prev, msg];
        });

        if (!msgConversationId) return;

        setConversations((prev) => {
          const now = Date.now();

          const updated = prev.map((c) =>
            c.id === msgConversationId
              ? {
                  ...c,
                  hasUnread: c.id !== currentConversationIdRef.current,
                  lastMessageAt: now,
                }
              : c
          );

          return [...updated].sort(
            (a, b) => (b.lastMessageAt ?? 0) - (a.lastMessageAt ?? 0)
          );
        });
      }
    );

    return () => {
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, []);

  useEffect(() => {
    currentConversationIdRef.current = currentConversation?.id ?? null;
  }, [currentConversation]);

  useEffect(() => {
    if (currentConversation && socketRef.current) {
      socketRef.current.emit("joinConversation", {
        conversationId: currentConversation.id,
      });
    }
  }, [currentConversation]);

  useEffect(() => {
    async function init() {
      try {
        setLoading(true);

        const allConvs = await getMyConversations();

        const allConvsWithUI: ConversationWithUI[] = allConvs.map((c) => ({
          ...c,
          hasUnread: false,
          lastMessageAt: 0,
        }));

        setConversations(allConvsWithUI);

        if (articleId) setArticle(await getArticleById(articleId));
        if (shopId) setShop(await getShopById(shopId));

        if (articleId) {
          const existing = allConvsWithUI.find(
            (c) => c.articleId === articleId
          );
          if (existing) {
            setCurrentConversation(existing);
            setMessages(await loadMessages(existing.id));
          }
        }

        if (!articleId && allConvsWithUI.length > 0) {
          const firstConv = allConvsWithUI[0];
          setCurrentConversation(firstConv);
          setMessages(await loadMessages(firstConv.id));
          setArticle(await getArticleById(firstConv.articleId));
          setShop(await getShopById(firstConv.shopId));
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
        lastMessageAt: Date.now(),
      };

      setCurrentConversation(newConv);
      setConversations((prev) => [newConv, ...prev]);
      setContent("");
      return;
    }

    if (currentConversation) {
      await sendMessage(currentConversation.id, content);
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
                setMessages(await loadMessages(c.id));
                setArticle(await getArticleById(c.articleId));
                setShop(await getShopById(c.shopId));

                setConversations((prev) =>
                  prev.map((conv) =>
                    conv.id === c.id ? { ...conv, hasUnread: false } : conv
                  )
                );
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
                Article :{" "}
                {articleTitlesById[c.articleId] ??
                  (articleId && articleTitlesById[articleId]) ??
                  "…"}
              </Typography>

              <Typography fontSize={12} color="gray">
                ID : {c.articleId}
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
