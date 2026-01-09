import { Router } from 'express';
import { ChatController } from '../controllers/chat/ChatController';
import { askQuestionValidation } from '../middleware/validators';

export const createChatRoutes = (chatController: ChatController): Router => {
  const router = Router();

  router.post('/ask', askQuestionValidation, chatController.askQuestion);
  router.get('/history/:userId', chatController.getChatHistory);

  return router;
};
