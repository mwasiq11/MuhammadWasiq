import express, { Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler';
import { createUserRoutes } from './routes/userRoutes';
import { createChatRoutes } from './routes/chatRoutes';
import { createSubscriptionRoutes } from './routes/subscriptionRoutes';

// Repositories
import { UserRepository } from './infrastructure/repositories/UserRepository';
import { ChatMessageRepository } from './infrastructure/repositories/ChatMessageRepository';
import { SubscriptionBundleRepository } from './infrastructure/repositories/SubscriptionBundleRepository';
import { UsageHistoryRepository } from './infrastructure/repositories/UsageHistoryRepository';

// Services
import { OpenAIService } from './services/OpenAIService';
import { ChatService } from './services/ChatService';
import { SubscriptionService } from './services/SubscriptionService';

// Controllers
import { UserController } from './controllers/users/UserController';
import { ChatController } from './controllers/chat/ChatController';
import { SubscriptionController } from './controllers/subscriptions/SubscriptionController';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize repositories
const userRepository = new UserRepository();
const chatMessageRepository = new ChatMessageRepository();
const subscriptionBundleRepository = new SubscriptionBundleRepository();
const usageHistoryRepository = new UsageHistoryRepository();

// Initialize services
const openAIService = new OpenAIService();
const chatService = new ChatService(
  userRepository,
  chatMessageRepository,
  subscriptionBundleRepository,
  openAIService,
);
const subscriptionService = new SubscriptionService(
  subscriptionBundleRepository,
  usageHistoryRepository,
);

// Initialize controllers
const userController = new UserController(userRepository);
const chatController = new ChatController(chatService);
const subscriptionController = new SubscriptionController(subscriptionService);

// Routes
app.use('/api/users', createUserRoutes(userController));
app.use('/api/chat', createChatRoutes(chatController));
app.use('/api/subscriptions', createSubscriptionRoutes(subscriptionController));

// Health check
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.info(` Server is running on port ${PORT}`);
  console.info(` Health check: http://localhost:${PORT}/health`);
  console.info(` API Base URL: http://localhost:${PORT}/api`);
});

export default app;
