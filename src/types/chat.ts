export interface ChatMessage {
  id: string;
  content: string;
  sender: { id: string };
  receiver: { id: string };
  sent_at: string;
}

export interface ChatPayload {
  sender: string;
  receiver: string;
  articleId: string;
  content: string;
}
