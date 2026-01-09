export interface ChatMessage {
  id: number;
  userId: number;
  question: string;
  answer: string;
  tokensUsed: number;
  subscriptionBundleId: number | null;
  isFreeMessage: boolean;
  createdAt: Date;
}

export interface CreateChatMessageDTO {
  userId: number;
  question: string;
  answer: string;
  tokensUsed: number;
  subscriptionBundleId?: number | null;
  isFreeMessage?: boolean;
}
