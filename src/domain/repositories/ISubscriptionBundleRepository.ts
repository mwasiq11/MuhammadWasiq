import {
  SubscriptionBundle,
  CreateSubscriptionBundleDTO,
} from '../../domain/entities/SubscriptionBundle';

export interface ISubscriptionBundleRepository {
  findById(id: number): Promise<SubscriptionBundle | null>;
  findActiveByUserId(userId: number): Promise<SubscriptionBundle[]>;
  findByUserId(userId: number): Promise<SubscriptionBundle[]>;
  create(bundle: CreateSubscriptionBundleDTO): Promise<SubscriptionBundle>;
  update(id: number, updates: Partial<SubscriptionBundle>): Promise<SubscriptionBundle>;
  incrementMessagesUsed(id: number): Promise<void>;
  cancelSubscription(id: number): Promise<void>;
  findExpiredSubscriptionsWithAutoRenew(): Promise<SubscriptionBundle[]>;
}
