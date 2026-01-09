import { UsageHistory, CreateUsageHistoryDTO } from '../../domain/entities/UsageHistory';

export interface IUsageHistoryRepository {
  create(history: CreateUsageHistoryDTO): Promise<UsageHistory>;
  findByUserId(userId: number): Promise<UsageHistory[]>;
  findBySubscriptionBundleId(subscriptionBundleId: number): Promise<UsageHistory[]>;
}
