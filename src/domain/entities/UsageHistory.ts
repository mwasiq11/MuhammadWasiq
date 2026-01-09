export interface UsageHistory {
  id: number;
  userId: number;
  subscriptionBundleId: number;
  messagesCount: number;
  periodStart: Date;
  periodEnd: Date;
  createdAt: Date;
}

export interface CreateUsageHistoryDTO {
  userId: number;
  subscriptionBundleId: number;
  messagesCount: number;
  periodStart: Date;
  periodEnd: Date;
}
