import { User, CreateUserDTO } from '../../domain/entities/User';

export interface IUserRepository {
  findById(id: number): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(user: CreateUserDTO): Promise<User>;
  update(id: number, updates: Partial<User>): Promise<User>;
  resetFreeMessages(userId: number): Promise<void>;
}
