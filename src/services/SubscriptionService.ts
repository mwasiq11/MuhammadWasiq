import { ISubscriptionBundleRepository } from '../domain/repositories/ISubscriptionBundleRepository';
import { IUsageHistoryRepository } from '../domain/repositories/IUsageHistoryRepository';
import {
  SubscriptionBundle,
  CreateSubscriptionBundleDTO,
} from '../domain/entities/SubscriptionBundle';
import {
  NotFoundError,
  ValidationError,
  InactiveSubscriptionError,
} from '../domain/errors/AppError';

export class SubscriptionService {
  constructor(
    private subscriptionBundleRepository: ISubscriptionBundleRepository,
    private usageHistoryRepository: IUsageHistoryRepository,
  ) {}

  async createSubscriptionBundle(
    bundleDTO: CreateSubscriptionBundleDTO,
  ): Promise<SubscriptionBundle> {
    // Validate bundle type
    if (!['Basic', 'Pro', 'Enterprise'].includes(bundleDTO.bundleType)) {
      throw new ValidationError('Invalid bundle type. Must be Basic, Pro, or Enterprise.');
    }

    // Validate billing cycle
    if (!['monthly', 'yearly'].includes(bundleDTO.billingCycle)) {
      throw new ValidationError('Invalid billing cycle. Must be monthly or yearly.');
    }

    return this.subscriptionBundleRepository.create(bundleDTO);
  }

  async getUserSubscriptions(userId: number): Promise<SubscriptionBundle[]> {
    return this.subscriptionBundleRepository.findByUserId(userId);
  }

  async getActiveSubscriptions(userId: number): Promise<SubscriptionBundle[]> {
    return this.subscriptionBundleRepository.findActiveByUserId(userId);
  }

  async toggleAutoRenew(subscriptionId: number, autoRenew: boolean): Promise<SubscriptionBundle> {
    const subscription = await this.subscriptionBundleRepository.findById(subscriptionId);
    if (!subscription) {
      throw new NotFoundError('Subscription bundle not found');
    }

    return this.subscriptionBundleRepository.update(subscriptionId, { autoRenew });
  }

  async cancelSubscription(subscriptionId: number): Promise<void> {
    const subscription = await this.subscriptionBundleRepository.findById(subscriptionId);
    if (!subscription) {
      throw new NotFoundError('Subscription bundle not found');
    }

    if (!subscription.isActive) {
      throw new InactiveSubscriptionError('Subscription is already inactive');
    }

    // Cancel subscription (will not renew, but remains active until end date)
    await this.subscriptionBundleRepository.cancelSubscription(subscriptionId);

    // Preserve usage history
    await this.usageHistoryRepository.create({
      userId: subscription.userId,
      subscriptionBundleId: subscription.id,
      messagesCount: subscription.messagesUsed,
      periodStart: subscription.startDate,
      periodEnd: new Date(),
    });
  }

  async getSubscriptionDetails(subscriptionId: number): Promise<SubscriptionBundle> {
    const subscription = await this.subscriptionBundleRepository.findById(subscriptionId);
    if (!subscription) {
      throw new NotFoundError('Subscription bundle not found');
    }
    return subscription;
  }

  // Simulate billing logic for auto-renewal (would be called by a cron job)
  async processAutoRenewals(): Promise<void> {
    const expiredSubscriptions =
      await this.subscriptionBundleRepository.findExpiredSubscriptionsWithAutoRenew();

    for (const subscription of expiredSubscriptions) {
      try {
        // Simulate payment processing (randomly fail 10% of the time)
        const paymentSuccess = Math.random() > 0.1;

        if (paymentSuccess) {
          // Renew subscription
          await this.renewSubscription(subscription);
        } else {
          // Payment failed, mark subscription inactive
          await this.subscriptionBundleRepository.update(subscription.id, {
            isActive: false,
          });
          console.warn(`Payment failed for subscription ${subscription.id}. Marked as inactive.`);
        }
      } catch (error) {
        console.error(`Error processing renewal for subscription ${subscription.id}:`, error);
      }
    }
  }

  private async renewSubscription(subscription: SubscriptionBundle): Promise<void> {
    // Save current period to usage history
    await this.usageHistoryRepository.create({
      userId: subscription.userId,
      subscriptionBundleId: subscription.id,
      messagesCount: subscription.messagesUsed,
      periodStart: subscription.startDate,
      periodEnd: subscription.endDate,
    });

    // Calculate new dates
    const newStartDate = subscription.endDate;
    const newEndDate = new Date(newStartDate);
    if (subscription.billingCycle === 'monthly') {
      newEndDate.setMonth(newEndDate.getMonth() + 1);
    } else {
      newEndDate.setFullYear(newEndDate.getFullYear() + 1);
    }

    // Reset subscription for new period
    await this.subscriptionBundleRepository.update(subscription.id, {
      messagesUsed: 0,
      endDate: newEndDate,
      renewalDate: new Date(newEndDate),
    });

    console.info(`Successfully renewed subscription ${subscription.id}`);
  }
}
