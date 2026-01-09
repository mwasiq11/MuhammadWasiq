import { Router } from 'express';
import { UserController } from '../controllers/users/UserController';
import { createUserValidation } from '../middleware/validators';

export const createUserRoutes = (userController: UserController): Router => {
  const router = Router();

  router.post('/', createUserValidation, userController.createUser);
  router.get('/:userId', userController.getUserById);
  router.get('/', userController.getUserByEmail);

  return router;
};
