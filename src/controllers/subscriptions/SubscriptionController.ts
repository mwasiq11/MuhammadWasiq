import { Request, Response, NextFunction } from 'express';
import { SubscriptionService } from '../../services/SubscriptionService';
import { validationResult } from 'express-validator';
import { CreateSubscriptionBundleDTO } from '../../domain/entities/SubscriptionBundle';

export class SubscriptionController {
  constructor(private subscriptionService: SubscriptionService) {}

  createSubscription = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const { userId, bundleType, billingCycle, autoRenew } = req.body;

      const bundleDTO: CreateSubscriptionBundleDTO = {
        userId,
        bundleType,
        billingCycle,
        autoRenew,
      };

      const subscription = await this.subscriptionService.createSubscriptionBundle(bundleDTO);

      res.status(201).json({
        success: true,
        data: subscription,
      });
    } catch (error) {
      next(error);
    }
  };

  getUserSubscriptions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = parseInt(req.params.userId);
      const subscriptions = await this.subscriptionService.getUserSubscriptions(userId);

      res.status(200).json({
        success: true,
        data: subscriptions,
        count: subscriptions.length,
      });
    } catch (error) {
      next(error);
    }
  };

  getActiveSubscriptions = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const userId = parseInt(req.params.userId);
      const subscriptions = await this.subscriptionService.getActiveSubscriptions(userId);

      res.status(200).json({
        success: true,
        data: subscriptions,
        count: subscriptions.length,
      });
    } catch (error) {
      next(error);
    }
  };

  getSubscriptionDetails = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const subscriptionId = parseInt(req.params.subscriptionId);
      const subscription = await this.subscriptionService.getSubscriptionDetails(subscriptionId);

      res.status(200).json({
        success: true,
        data: subscription,
      });
    } catch (error) {
      next(error);
    }
  };

  toggleAutoRenew = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const subscriptionId = parseInt(req.params.subscriptionId);
      const { autoRenew } = req.body;

      const subscription = await this.subscriptionService.toggleAutoRenew(
        subscriptionId,
        autoRenew,
      );

      res.status(200).json({
        success: true,
        data: subscription,
      });
    } catch (error) {
      next(error);
    }
  };

  cancelSubscription = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const subscriptionId = parseInt(req.params.subscriptionId);
      await this.subscriptionService.cancelSubscription(subscriptionId);

      res.status(200).json({
        success: true,
        message:
          'Subscription cancelled successfully. It will remain active until the end of the current billing cycle.',
      });
    } catch (error) {
      next(error);
    }
  };
}
