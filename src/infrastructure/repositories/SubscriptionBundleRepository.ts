import { query } from '../database/connection';
import {
  SubscriptionBundle,
  CreateSubscriptionBundleDTO,
  BUNDLE_CONFIG,
} from '../../domain/entities/SubscriptionBundle';
import { ISubscriptionBundleRepository } from '../../domain/repositories/ISubscriptionBundleRepository';

export class SubscriptionBundleRepository implements ISubscriptionBundleRepository {
  async findById(id: number): Promise<SubscriptionBundle | null> {
    const result = await query('SELECT * FROM subscription_bundles WHERE id = $1', [id]);
    if (result.rows.length === 0) return null;
    return this.mapRowToBundle(result.rows[0]);
  }

  async findActiveByUserId(userId: number): Promise<SubscriptionBundle[]> {
    const result = await query(
      `SELECT * FROM subscription_bundles 
       WHERE user_id = $1 AND is_active = true 
       ORDER BY end_date DESC`,
      [userId],
    );
    return result.rows.map((row) => this.mapRowToBundle(row));
  }

  async findByUserId(userId: number): Promise<SubscriptionBundle[]> {
    const result = await query(
      'SELECT * FROM subscription_bundles WHERE user_id = $1 ORDER BY created_at DESC',
      [userId],
    );
    return result.rows.map((row) => this.mapRowToBundle(row));
  }

  async create(bundleDTO: CreateSubscriptionBundleDTO): Promise<SubscriptionBundle> {
    const config = BUNDLE_CONFIG[bundleDTO.bundleType];
    const price = bundleDTO.billingCycle === 'monthly' ? config.monthlyPrice : config.yearlyPrice;
    const maxMessages = config.maxMessages === -1 ? 999999 : config.maxMessages;

    const startDate = new Date();
    const endDate = new Date(startDate);
    if (bundleDTO.billingCycle === 'monthly') {
      endDate.setMonth(endDate.getMonth() + 1);
    } else {
      endDate.setFullYear(endDate.getFullYear() + 1);
    }
    const renewalDate = new Date(endDate);

    const result = await query(
      `INSERT INTO subscription_bundles 
       (user_id, bundle_type, max_messages, messages_used, price, billing_cycle, 
        start_date, end_date, renewal_date, auto_renew, is_active)
       VALUES ($1, $2, $3, 0, $4, $5, $6, $7, $8, $9, true)
       RETURNING *`,
      [
        bundleDTO.userId,
        bundleDTO.bundleType,
        maxMessages,
        price,
        bundleDTO.billingCycle,
        startDate,
        endDate,
        renewalDate,
        bundleDTO.autoRenew ?? true,
      ],
    );
    return this.mapRowToBundle(result.rows[0]);
  }

  async update(id: number, updates: Partial<SubscriptionBundle>): Promise<SubscriptionBundle> {
    const setClauses: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    if (updates.messagesUsed !== undefined) {
      setClauses.push(`messages_used = $${paramIndex++}`);
      values.push(updates.messagesUsed);
    }
    if (updates.autoRenew !== undefined) {
      setClauses.push(`auto_renew = $${paramIndex++}`);
      values.push(updates.autoRenew);
    }
    if (updates.isActive !== undefined) {
      setClauses.push(`is_active = $${paramIndex++}`);
      values.push(updates.isActive);
    }
    if (updates.endDate !== undefined) {
      setClauses.push(`end_date = $${paramIndex++}`);
      values.push(updates.endDate);
    }
    if (updates.renewalDate !== undefined) {
      setClauses.push(`renewal_date = $${paramIndex++}`);
      values.push(updates.renewalDate);
    }

    values.push(id);
    const result = await query(
      `UPDATE subscription_bundles SET ${setClauses.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values,
    );
    return this.mapRowToBundle(result.rows[0]);
  }

  async incrementMessagesUsed(id: number): Promise<void> {
    await query('UPDATE subscription_bundles SET messages_used = messages_used + 1 WHERE id = $1', [
      id,
    ]);
  }

  async cancelSubscription(id: number): Promise<void> {
    await query('UPDATE subscription_bundles SET auto_renew = false WHERE id = $1', [id]);
  }

  async findExpiredSubscriptionsWithAutoRenew(): Promise<SubscriptionBundle[]> {
    const result = await query(
      `SELECT * FROM subscription_bundles 
       WHERE is_active = true AND auto_renew = true AND end_date <= CURRENT_TIMESTAMP`,
    );
    return result.rows.map((row) => this.mapRowToBundle(row));
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private mapRowToBundle(row: any): SubscriptionBundle {
    return {
      id: row.id,
      userId: row.user_id,
      bundleType: row.bundle_type,
      maxMessages: row.max_messages,
      messagesUsed: row.messages_used,
      price: parseFloat(row.price),
      billingCycle: row.billing_cycle,
      startDate: new Date(row.start_date),
      endDate: new Date(row.end_date),
      renewalDate: new Date(row.renewal_date),
      autoRenew: row.auto_renew,
      isActive: row.is_active,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }
}
