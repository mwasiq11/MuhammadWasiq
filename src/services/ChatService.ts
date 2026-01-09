import { IUserRepository } from '../domain/repositories/IUserRepository';
import { IChatMessageRepository } from '../domain/repositories/IChatMessageRepository';
import { ISubscriptionBundleRepository } from '../domain/repositories/ISubscriptionBundleRepository';
import { OpenAIService } from './OpenAIService';
import { ChatMessage } from '../domain/entities/ChatMessage';
import {
  QuotaExceededError,
  SubscriptionRequiredError,
  NotFoundError,
} from '../domain/errors/AppError';

const FREE_MESSAGES_PER_MONTH = 3;

export class ChatService {
  constructor(
    private userRepository: IUserRepository,
    private chatMessageRepository: IChatMessageRepository,
    private subscriptionBundleRepository: ISubscriptionBundleRepository,
    private openAIService: OpenAIService,
  ) {}

  async processUserQuestion(userId: number, question: string): Promise<ChatMessage> {
    // Get user
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Check if free messages need to be reset
    await this.checkAndResetFreeMessages(userId, user.freeMessagesResetDate);

    // Try to use free messages first
    if (user.freeMessagesUsed < FREE_MESSAGES_PER_MONTH) {
      const { answer, tokensUsed } = await this.openAIService.generateResponse(question);

      // Save message
      const message = await this.chatMessageRepository.create({
        userId,
        question,
        answer,
        tokensUsed,
        isFreeMessage: true,
      });

      // Increment free messages used
      await this.userRepository.update(userId, {
        freeMessagesUsed: user.freeMessagesUsed + 1,
      });

      return message;
    }

    // Free messages exhausted, check for active subscription bundles
    const activeSubscriptions = await this.subscriptionBundleRepository.findActiveByUserId(userId);

    if (activeSubscriptions.length === 0) {
      throw new SubscriptionRequiredError(
        'Free messages exhausted. Please purchase a subscription bundle.',
      );
    }

    // Find subscription with remaining quota (prioritize by latest remaining quota)
    const availableSubscription = this.findSubscriptionWithQuota(activeSubscriptions);

    if (!availableSubscription) {
      throw new QuotaExceededError(
        'All subscription bundles have exhausted their quota. Please purchase a new bundle or upgrade.',
      );
    }

    // Generate response
    const { answer, tokensUsed } = await this.openAIService.generateResponse(question);

    // Save message
    const message = await this.chatMessageRepository.create({
      userId,
      question,
      answer,
      tokensUsed,
      subscriptionBundleId: availableSubscription.id,
      isFreeMessage: false,
    });

    // Increment subscription bundle usage
    await this.subscriptionBundleRepository.incrementMessagesUsed(availableSubscription.id);

    return message;
  }

  async getChatHistory(userId: number, limit?: number): Promise<ChatMessage[]> {
    return this.chatMessageRepository.findByUserId(userId, limit);
  }

  private async checkAndResetFreeMessages(userId: number, resetDate: Date): Promise<void> {
    const now = new Date();
    const resetMonth = resetDate.getMonth();
    const currentMonth = now.getMonth();

    // Reset if we're in a new month
    if (currentMonth !== resetMonth || now.getFullYear() !== resetDate.getFullYear()) {
      await this.userRepository.resetFreeMessages(userId);
    }
  }

  private findSubscriptionWithQuota(
    subscriptions: Array<{
      id: number;
      maxMessages: number;
      messagesUsed: number;
      bundleType: string;
    }>,
  ) {
    // Sort by remaining quota (descending)
    const sorted = subscriptions
      .map((sub) => ({
        ...sub,
        remainingQuota: sub.maxMessages - sub.messagesUsed,
      }))
      .filter((sub) => sub.remainingQuota > 0)
      .sort((a, b) => b.remainingQuota - a.remainingQuota);

    return sorted.length > 0 ? sorted[0] : null;
  }
}
