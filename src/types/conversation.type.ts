export interface ConversationMessage {
  id: string;
  conversationId: string | undefined;
  senderId: string;
  content: string;
  created_at: string;
}

export interface Conversation {
  id: string;
  articleId: string;
  shopId: string;
  buyerId: string;
  sellerId: string;
  created_at: string;
  updated_at: string;
  articleTitle?: string;
  articleImage?: string;
  articlePrice?: number;
  shopName?: string;
  hasUnread?: boolean;
  lastMessageAt?: string;
}
