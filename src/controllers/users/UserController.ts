import { Request, Response, NextFunction } from 'express';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { validationResult } from 'express-validator';
import { CreateUserDTO } from '../../domain/entities/User';

export class UserController {
  constructor(private userRepository: IUserRepository) {}

  createUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const { email, name } = req.body;

      // Check if user already exists
      const existingUser = await this.userRepository.findByEmail(email);
      if (existingUser) {
        res.status(409).json({
          success: false,
          message: 'User with this email already exists',
        });
        return;
      }

      const userDTO: CreateUserDTO = { email, name };
      const user = await this.userRepository.create(userDTO);

      res.status(201).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  };

  getUserById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = parseInt(req.params.userId);
      const user = await this.userRepository.findById(userId);

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  };

  getUserByEmail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const email = req.query.email as string;
      if (!email) {
        res.status(400).json({
          success: false,
          message: 'Email query parameter is required',
        });
        return;
      }

      const user = await this.userRepository.findByEmail(email);

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  };
}
