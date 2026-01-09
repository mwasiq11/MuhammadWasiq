import { query } from '../database/connection';
import { UsageHistory, CreateUsageHistoryDTO } from '../../domain/entities/UsageHistory';
import { IUsageHistoryRepository } from '../../domain/repositories/IUsageHistoryRepository';

export class UsageHistoryRepository implements IUsageHistoryRepository {
  async create(historyDTO: CreateUsageHistoryDTO): Promise<UsageHistory> {
    const result = await query(
      `INSERT INTO usage_history 
       (user_id, subscription_bundle_id, messages_count, period_start, period_end)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        historyDTO.userId,
        historyDTO.subscriptionBundleId,
        historyDTO.messagesCount,
        historyDTO.periodStart,
        historyDTO.periodEnd,
      ],
    );
    return this.mapRowToHistory(result.rows[0]);
  }

  async findByUserId(userId: number): Promise<UsageHistory[]> {
    const result = await query(
      'SELECT * FROM usage_history WHERE user_id = $1 ORDER BY created_at DESC',
      [userId],
    );
    return result.rows.map((row) => this.mapRowToHistory(row));
  }

  async findBySubscriptionBundleId(subscriptionBundleId: number): Promise<UsageHistory[]> {
    const result = await query(
      'SELECT * FROM usage_history WHERE subscription_bundle_id = $1 ORDER BY created_at DESC',
      [subscriptionBundleId],
    );
    return result.rows.map((row) => this.mapRowToHistory(row));
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private mapRowToHistory(row: any): UsageHistory {
    return {
      id: row.id,
      userId: row.user_id,
      subscriptionBundleId: row.subscription_bundle_id,
      messagesCount: row.messages_count,
      periodStart: new Date(row.period_start),
      periodEnd: new Date(row.period_end),
      createdAt: new Date(row.created_at),
    };
  }
}
