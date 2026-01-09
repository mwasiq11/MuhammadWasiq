import { query } from '../database/connection';
import { User, CreateUserDTO } from '../../domain/entities/User';
import { IUserRepository } from '../../domain/repositories/IUserRepository';

export class UserRepository implements IUserRepository {
  async findById(id: number): Promise<User | null> {
    const result = await query('SELECT * FROM users WHERE id = $1', [id]);
    if (result.rows.length === 0) return null;
    return this.mapRowToUser(result.rows[0]);
  }

  async findByEmail(email: string): Promise<User | null> {
    const result = await query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) return null;
    return this.mapRowToUser(result.rows[0]);
  }

  async create(userDTO: CreateUserDTO): Promise<User> {
    const result = await query(
      `INSERT INTO users (email, name, free_messages_used, free_messages_reset_date)
       VALUES ($1, $2, 0, CURRENT_DATE)
       RETURNING *`,
      [userDTO.email, userDTO.name],
    );
    return this.mapRowToUser(result.rows[0]);
  }

  async update(id: number, updates: Partial<User>): Promise<User> {
    const setClauses: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    if (updates.email !== undefined) {
      setClauses.push(`email = $${paramIndex++}`);
      values.push(updates.email);
    }
    if (updates.name !== undefined) {
      setClauses.push(`name = $${paramIndex++}`);
      values.push(updates.name);
    }
    if (updates.freeMessagesUsed !== undefined) {
      setClauses.push(`free_messages_used = $${paramIndex++}`);
      values.push(updates.freeMessagesUsed);
    }
    if (updates.freeMessagesResetDate !== undefined) {
      setClauses.push(`free_messages_reset_date = $${paramIndex++}`);
      values.push(updates.freeMessagesResetDate);
    }

    values.push(id);
    const result = await query(
      `UPDATE users SET ${setClauses.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values,
    );
    return this.mapRowToUser(result.rows[0]);
  }

  async resetFreeMessages(userId: number): Promise<void> {
    await query(
      'UPDATE users SET free_messages_used = 0, free_messages_reset_date = CURRENT_DATE WHERE id = $1',
      [userId],
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private mapRowToUser(row: any): User {
    return {
      id: row.id,
      email: row.email,
      name: row.name,
      freeMessagesUsed: row.free_messages_used,
      freeMessagesResetDate: new Date(row.free_messages_reset_date),
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }
}
