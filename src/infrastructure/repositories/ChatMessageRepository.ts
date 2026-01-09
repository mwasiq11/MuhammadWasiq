import { query } from '../database/connection';
import { ChatMessage, CreateChatMessageDTO } from '../../domain/entities/ChatMessage';
import { IChatMessageRepository } from '../../domain/repositories/IChatMessageRepository';

export class ChatMessageRepository implements IChatMessageRepository {
  async findById(id: number): Promise<ChatMessage | null> {
    const result = await query('SELECT * FROM chat_messages WHERE id = $1', [id]);
    if (result.rows.length === 0) return null;
    return this.mapRowToMessage(result.rows[0]);
  }

  async findByUserId(userId: number, limit: number = 50): Promise<ChatMessage[]> {
    const result = await query(
      'SELECT * FROM chat_messages WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2',
      [userId, limit],
    );
    return result.rows.map((row) => this.mapRowToMessage(row));
  }

  async create(messageDTO: CreateChatMessageDTO): Promise<ChatMessage> {
    const result = await query(
      `INSERT INTO chat_messages 
       (user_id, question, answer, tokens_used, subscription_bundle_id, is_free_message)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        messageDTO.userId,
        messageDTO.question,
        messageDTO.answer,
        messageDTO.tokensUsed,
        messageDTO.subscriptionBundleId ?? null,
        messageDTO.isFreeMessage ?? false,
      ],
    );
    return this.mapRowToMessage(result.rows[0]);
  }

  async getMonthlyUsageForUser(userId: number): Promise<number> {
    const result = await query(
      `SELECT COUNT(*) as count FROM chat_messages 
       WHERE user_id = $1 
       AND is_free_message = true 
       AND created_at >= DATE_TRUNC('month', CURRENT_DATE)`,
      [userId],
    );
    return parseInt(result.rows[0].count);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private mapRowToMessage(row: any): ChatMessage {
    return {
      id: row.id,
      userId: row.user_id,
      question: row.question,
      answer: row.answer,
      tokensUsed: row.tokens_used,
      subscriptionBundleId: row.subscription_bundle_id,
      isFreeMessage: row.is_free_message,
      createdAt: new Date(row.created_at),
    };
  }
}
