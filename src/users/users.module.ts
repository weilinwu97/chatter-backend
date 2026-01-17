import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersResolver } from './users.resolver';
import { UserRepository } from './users.repository';
import { DatabaseModule } from 'src/common/database/database.module';
import { User, UserSchema } from './entities/user.entity';

/**
 * Users Module - Organizes all user-related functionality.
 *
 * In NestJS, modules are like containers that group related code together.
 * This module brings together everything needed for user management:
 * - GraphQL resolver (handles incoming GraphQL queries/mutations)
 * - Service (contains business logic)
 * - Repository (handles database operations)
 *
 * The @Module decorator tells NestJS how to wire up the dependencies.
 */
@Module({
  /**
   * Imports: Other modules this module depends on.
   *
   * DatabaseModule.forFeature() registers the User model with Mongoose:
   * - name: User.name = The collection name (becomes "users" in MongoDB)
   * - schema: UserSchema = The structure/blueprint for User documents
   *
   * This makes the User model available for dependency injection in UserRepository.
   */
  imports: [
    DatabaseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],

  /**
   * Providers: Classes that can be injected as dependencies.
   *
   * NestJS will create instances of these classes and inject them where needed:
   * - UsersResolver = Handles GraphQL queries/mutations (entry point for API requests)
   * - UsersService = Contains business logic (processes data, validation, etc.)
   * - UserRepository = Handles database operations (CRUD operations)
   *
   * Dependency flow: Resolver -> Service -> Repository -> Database
   */
  providers: [UsersResolver, UsersService, UserRepository],
  exports: [UsersService],
})
export class UsersModule {}
