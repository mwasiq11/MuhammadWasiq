import { Router } from 'express';
import { SubscriptionController } from '../controllers/subscriptions/SubscriptionController';
import { createSubscriptionValidation, toggleAutoRenewValidation } from '../middleware/validators';

export const createSubscriptionRoutes = (
  subscriptionController: SubscriptionController,
): Router => {
  const router = Router();

  router.post('/', createSubscriptionValidation, subscriptionController.createSubscription);
  router.get('/user/:userId', subscriptionController.getUserSubscriptions);
  router.get('/user/:userId/active', subscriptionController.getActiveSubscriptions);
  router.get('/:subscriptionId', subscriptionController.getSubscriptionDetails);
  router.patch(
    '/:subscriptionId/auto-renew',
    toggleAutoRenewValidation,
    subscriptionController.toggleAutoRenew,
  );
  router.delete('/:subscriptionId', subscriptionController.cancelSubscription);

  return router;
};
