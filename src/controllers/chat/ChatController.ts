import { Request, Response, NextFunction } from 'express';
import { ChatService } from '../../services/ChatService';
import { validationResult } from 'express-validator';

export class ChatController {
  constructor(private chatService: ChatService) {}

  askQuestion = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const { userId, question } = req.body;

      const message = await this.chatService.processUserQuestion(userId, question);

      res.status(200).json({
        success: true,
        data: {
          id: message.id,
          question: message.question,
          answer: message.answer,
          tokensUsed: message.tokensUsed,
          isFreeMessage: message.isFreeMessage,
          createdAt: message.createdAt,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  getChatHistory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = parseInt(req.params.userId);
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;

      const messages = await this.chatService.getChatHistory(userId, limit);

      res.status(200).json({
        success: true,
        data: messages,
        count: messages.length,
      });
    } catch (error) {
      next(error);
    }
  };
}
