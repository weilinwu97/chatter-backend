import { AbstractRepository } from 'src/common/database/abstract.repository';
import { User } from './entities/user.entity';
import { Injectable, Logger } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

/**
 * User Repository - Handles all database operations for User entities.
 *
 * This repository extends AbstractRepository, which means it automatically inherits
 * common database methods like:
 * - create() = Add a new user to the database
 * - findOne() = Find a user by filter (e.g., by email or ID)
 * - find() = Get all users or filter by criteria
 * - findOneAndUpdate() = Update a user's information
 * - findOneAndDelete() = Remove a user from the database
 *
 * You can add custom user-specific database methods here (see examples below).
 *
 * @Injectable() makes this class available for dependency injection in the service.
 *
 * Architecture Flow:
 * Resolver -> Service -> Repository -> Database
 *                       (YOU ARE HERE)
 */
@Injectable()
export class UserRepository extends AbstractRepository<User> {
  /**
   * Logger instance for debugging and error tracking.
   *
   * This is required by AbstractRepository (it's marked as 'abstract').
   * The logger will automatically prefix all messages with "UserRepository"
   * for easy identification in logs.
   */
  protected readonly logger = new Logger(UserRepository.name);

  /**
   * Constructor with dependency injection.
   *
   * @param userModel - The Mongoose model for User documents, injected by NestJS
   *
   * @InjectModel(User.name) tells NestJS:
   * "Please inject the Mongoose model for the User entity that was registered in UsersModule"
   *
   * super(userModel) passes the model to AbstractRepository so it can perform
   * database operations on the User collection.
   */
  constructor(@InjectModel(User.name) userModel: Model<User>) {
    super(userModel); // Pass model to parent class
  }

  /**
   * This space is for custom user-specific database methods.
   *
   * Examples of methods you might add:
   *
   * // Find a user by their email address
   * async findByEmail(email: string): Promise<User | null> {
   *   return this.model.findOne({ email }).lean();
   * }
   *
   * // Check if an email is already taken
   * async emailExists(email: string): Promise<boolean> {
   *   const count = await this.model.countDocuments({ email });
   *   return count > 0;
   * }
   *
   * // Find users created after a specific date
   * async findRecentUsers(date: Date): Promise<User[]> {
   *   return this.model.find({ createdAt: { $gte: date } }).lean();
   * }
   *
   * Note: Basic CRUD operations are already available from AbstractRepository!
   */
}
