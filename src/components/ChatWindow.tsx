import { useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import axios from "axios";
import {
  Box,
  Paper,
  TextField,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Divider,
  Typography,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import type { ChatMessage } from "../types/chat";

interface Props {
  userId: string;
  receiverId: string;
  articleId: string;
  token: string;
}

export default function ChatWindow({
  userId,
  receiverId,
  articleId,
  token,
}: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);

  /** ⬇ Fonction chargement historique déclarée AVANT useEffect */
  const loadHistory = useCallback(async () => {
    const res = await axios.get<ChatMessage[]>(
      `http://localhost:4000/chat/${receiverId}/${articleId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setMessages(res.data);
  }, [receiverId, articleId, token]);

  useEffect(() => {
    socketRef.current = io("http://localhost:4000");

    socketRef.current.on(`chat_${userId}`, (msg: ChatMessage) => {
      setMessages((prev) => [...prev, msg]); // mise à jour async -> OK
    });

    // ⬇ isolation asynchrone pour éviter l'erreur React
    const init = async () => {
      await loadHistory();
    };
    init();

    return () => {
      socketRef.current?.disconnect();
    };
  }, [loadHistory, userId]);

  /** 🔄 Auto-scroll */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /** ✉ Envoi message */
  function sendMessage() {
    if (!text.trim()) return;

    socketRef.current?.emit("send_message", {
      sender: userId,
      receiver: receiverId,
      articleId,
      content: text,
    });

    setText("");
  }

  return (
    <Paper
      elevation={5}
      sx={{
        width: 400,
        height: 550,
        p: 2,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Typography variant="h6" sx={{ mb: 1, textAlign: "center" }}>
        💬 Discussion — Article #{articleId}
      </Typography>
      <Divider />

      <List sx={{ flex: 1, overflowY: "auto", mt: 1 }}>
        {messages.map((m) => (
          <ListItem
            key={m.id}
            sx={{
              justifyContent:
                m.sender.id === userId ? "flex-end" : "flex-start",
            }}
          >
            <ListItemText
              primary={m.content}
              sx={{
                maxWidth: "70%",
                px: 2,
                py: 1,
                borderRadius: 3,
                color: "#fff",
                bgcolor: m.sender.id === userId ? "primary.main" : "grey.800",
              }}
            />
          </ListItem>
        ))}
        <div ref={bottomRef} />
      </List>

      <Box sx={{ display: "flex", mt: 1 }}>
        <TextField
          fullWidth
          variant="outlined"
          size="small"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Écrire un message…"
        />
        <IconButton color="primary" onClick={sendMessage}>
          <SendIcon />
        </IconButton>
      </Box>
    </Paper>
  );
}
