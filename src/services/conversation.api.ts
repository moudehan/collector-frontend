import { API_URL } from "../config";
import type {
  Conversation,
  ConversationMessage,
} from "../types/conversation.type";

export async function getMyConversations(): Promise<Conversation[]> {
  const token = localStorage.getItem("UserToken");

  const res = await fetch(`${API_URL}/conversations`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error("Erreur conversations");
  return res.json();
}

export async function loadMessages(
  conversationId: string
): Promise<ConversationMessage[]> {
  const token = localStorage.getItem("UserToken");

  const res = await fetch(`${API_URL}/conversations/load-messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ conversationId }),
  });

  if (!res.ok) throw new Error("Erreur messages");
  return res.json();
}

export async function sendFirstMessage(payload: {
  articleId: string;
  shopId: string;
  sellerId: string;
  content: string;
}): Promise<ConversationMessage & { conversation: Conversation }> {
  const token = localStorage.getItem("UserToken");

  const res = await fetch(`${API_URL}/conversations/messages/first`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error("Erreur premier message");
  return res.json();
}

export async function sendMessage(
  conversationId: string,
  content: string
): Promise<ConversationMessage> {
  const token = localStorage.getItem("UserToken");

  const res = await fetch(`${API_URL}/conversations/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ conversationId, content }),
  });

  if (!res.ok) throw new Error("Erreur envoi message");
  return res.json();
}

export async function openConversation(payload: {
  articleId: string;
  shopId: string;
  sellerId: string;
}): Promise<Conversation> {
  const token = localStorage.getItem("UserToken");

  const res = await fetch(`${API_URL}/conversations/open`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error("Erreur open conversation");
  return res.json();
}

export async function getConversationById(conversationId: string) {
  const token = localStorage.getItem("UserToken");

  const res = await fetch(`${API_URL}/conversations/${conversationId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error("Erreur chargement conversation");
  return res.json();
}
export async function markConversationAsRead(
  conversationId: string
): Promise<void> {
  const token = localStorage.getItem("UserToken");

  const res = await fetch(`${API_URL}/conversations/${conversationId}/read`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error("Erreur markConversationAsRead");
}

export async function markConversationAsUnread(
  conversationId: string
): Promise<void> {
  const token = localStorage.getItem("UserToken");

  const res = await fetch(`${API_URL}/conversations/${conversationId}/unread`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error("Erreur markConversationAsUnread");
}
