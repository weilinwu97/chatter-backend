import { Injectable } from '@nestjs/common';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';
import { UserRepository } from './users.repository';
import * as bcrypt from 'bcrypt';

/**
 * Users Service - Contains the business logic for user operations.
 *
 * The service layer sits between the resolver (API entry point) and the repository
 * (database layer). This is where you put:
 * - Business logic and validation
 * - Data transformation
 * - Orchestration of multiple repository calls
 * - Complex operations that involve multiple entities
 *
 * @Injectable() decorator makes this class available for dependency injection.
 * NestJS will create a single instance (singleton) and inject it where needed.
 *
 * Architecture Flow:
 * GraphQL Client -> Resolver -> Service -> Repository -> Database
 *                               (YOU ARE HERE)
 */
@Injectable()
export class UsersService {
  /**
   * Constructor with dependency injection.
   *
   * NestJS automatically injects the UserRepository instance.
   * 'private readonly' makes it a class property accessible in this class only.
   */
  constructor(private readonly userRepository: UserRepository) {}

  /**
   * Creates a new user account.
   *
   * @param createUserInput - Input data from GraphQL mutation (email, password, etc.)
   * @returns Promise resolving to a success message (placeholder for now)
   *
   * TODO: Implement full user creation logic:
   * 1. Validate email format and uniqueness
   * 2. Hash the password (NEVER store plain text passwords!)
   * 3. Create user in database via repository
   * 4. Return the created user object
   */
  async create(createUserInput: CreateUserInput) {
    return this.userRepository.create({
      ...createUserInput,
      password: await this.hashPassword(createUserInput.password),
    });
  }

  private async hashPassword(password: string) {
    return await bcrypt.hash(password, 10);
  }

  /**
   * Retrieves all users from the database.
   *
   * @returns Promise resolving to an array of all User objects
   *
   * Key Concepts:
   * - async = This function returns a Promise
   * - await = Pauses execution until the database query completes
   * - {} = Empty filter object means "find all documents"
   *
   * Note: In production, you might want to:
   * - Add pagination (limit/skip)
   * - Filter out sensitive fields
   * - Add sorting options
   */
  async findAll() {
    // Call repository to fetch all users from database
    return await this.userRepository.find({});
  }

  /**
   * Finds a single user by their ID.
   *
   * @param id - The user's unique identifier
   * @returns Promise resolving to a message (placeholder for now)
   *
   * TODO: Implement user lookup:
   * 1. Convert the number ID to MongoDB ObjectId format
   * 2. Call repository.findOne({ _id: convertedId })
   * 3. Return the user object
   * 4. Handle case where user doesn't exist (repository throws NotFoundException)
   */
  async findOne(_id: string) {
    return await this.userRepository.findOne({ _id });
  }

  /**
   * Updates an existing user's information.
   *
   * @param id - The user's unique identifier
   * @param updateUserInput - Input data containing fields to update
   * @returns Promise resolving to a message (placeholder for now)
   *
   * TODO: Implement user update logic:
   * 1. Validate input data (e.g., email format if being changed)
   * 2. If password is being changed, hash it first
   * 3. Call repository.findOneAndUpdate({ _id: id }, updateUserInput)
   * 4. Return the updated user object
   */
  async update(_id: string, updateUserInput: UpdateUserInput) {
    return await this.userRepository.findOneAndUpdate(
      { _id },
      {
        $set: {
          ...updateUserInput,
          ...(updateUserInput.password && {
            password: this.hashPassword(updateUserInput.password),
          }),
        },
      },
    );
  }

  /**
   * Deletes a user from the database.
   *
   * @param id - The user's unique identifier
   * @returns Promise resolving to a message (placeholder for now)
   *
   * TODO: Implement user deletion:
   * 1. Call repository.findOneAndDelete({ _id: id })
   * 2. Optionally: Clean up related data (user's posts, comments, etc.)
   * 3. Return the deleted user object (useful for confirmation)
   */
  async remove(_id: string) {
    return await this.userRepository.findOneAndDelete({ _id });
  }
}
