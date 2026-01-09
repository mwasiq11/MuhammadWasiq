import { ChatMessage, CreateChatMessageDTO } from '../../domain/entities/ChatMessage';

export interface IChatMessageRepository {
  findById(id: number): Promise<ChatMessage | null>;
  findByUserId(userId: number, limit?: number): Promise<ChatMessage[]>;
  create(message: CreateChatMessageDTO): Promise<ChatMessage>;
  getMonthlyUsageForUser(userId: number): Promise<number>;
}
