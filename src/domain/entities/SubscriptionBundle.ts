export type BundleType = 'Basic' | 'Pro' | 'Enterprise';
export type BillingCycle = 'monthly' | 'yearly';

export interface SubscriptionBundle {
  id: number;
  userId: number;
  bundleType: BundleType;
  maxMessages: number;
  messagesUsed: number;
  price: number;
  billingCycle: BillingCycle;
  startDate: Date;
  endDate: Date;
  renewalDate: Date;
  autoRenew: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSubscriptionBundleDTO {
  userId: number;
  bundleType: BundleType;
  billingCycle: BillingCycle;
  autoRenew?: boolean;
}

export const BUNDLE_CONFIG = {
  Basic: { maxMessages: 10, monthlyPrice: 9.99, yearlyPrice: 99.99 },
  Pro: { maxMessages: 100, monthlyPrice: 29.99, yearlyPrice: 299.99 },
  Enterprise: { maxMessages: -1, monthlyPrice: 99.99, yearlyPrice: 999.99 }, // -1 means unlimited
} as const;
