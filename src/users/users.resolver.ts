import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';

/**
 * Users GraphQL Resolver - The entry point for all user-related GraphQL operations.
 *
 * Think of resolvers as "controllers" for GraphQL. They handle incoming GraphQL
 * queries and mutations from clients, validate the input, call the appropriate
 * service methods, and return the results.
 *
 * @Resolver(() => User) decorator tells GraphQL this resolver handles User-related operations.
 *
 * Key Concepts:
 * - Query = Read operations (GET in REST) - doesn't modify data
 * - Mutation = Write operations (POST, PUT, DELETE in REST) - modifies data
 * - Resolver delegates business logic to the service layer (separation of concerns)
 */
@Resolver(() => User)
export class UsersResolver {
  /**
   * Constructor with dependency injection.
   *
   * NestJS automatically injects the UsersService instance.
   * 'private readonly' makes it a class property that cannot be modified.
   */
  constructor(private readonly usersService: UsersService) {}

  /**
   * GraphQL Mutation to create a new user.
   *
   * @param createUserInput - Input data for the new user (email, password, etc.)
   * @returns The created User object
   *
   * @Mutation(() => User) tells GraphQL:
   * - This is a write operation (modifies data)
   * - It returns a User object
   *
   * @Args('createUserInput') extracts the 'createUserInput' argument from the GraphQL mutation.
   *
   * Example GraphQL mutation:
   *   mutation {
   *     createUser(createUserInput: { email: "test@example.com", password: "secret" }) {
   *       _id
   *       email
   *     }
   *   }
   */
  @Mutation(() => User)
  createUser(@Args('createUserInput') createUserInput: CreateUserInput) {
    // Delegate to service layer for business logic
    return this.usersService.create(createUserInput);
  }

  /**
   * GraphQL Query to fetch all users.
   *
   * @returns Array of all User objects
   *
   * @Query(() => [User]) tells GraphQL:
   * - This is a read operation
   * - It returns an array of User objects
   * - { name: 'users' } sets the query name in GraphQL schema
   *
   * Example GraphQL query:
   *   query {
   *     users {
   *       _id
   *       email
   *     }
   *   }
   */
  @Query(() => [User], { name: 'users' })
  findAll() {
    // Delegate to service to fetch all users
    return this.usersService.findAll();
  }

  /**
   * GraphQL Query to fetch a single user by ID.
   *
   * @param id - The user's unique identifier
   * @returns The User object with the specified ID
   *
   * @Args('id', { type: () => Int }) extracts the 'id' argument as an integer.
   *
   * Example GraphQL query:
   *   query {
   *     user(id: 123) {
   *       _id
   *       email
   *     }
   *   }
   */
  @Query(() => User, { name: 'user' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    // Delegate to service to find specific user
    return this.usersService.findOne(id);
  }

  /**
   * GraphQL Mutation to update an existing user.
   *
   * @param updateUserInput - Input data containing the user ID and fields to update
   * @returns The updated User object
   *
   * Example GraphQL mutation:
   *   mutation {
   *     updateUser(updateUserInput: { id: 123, email: "newemail@example.com" }) {
   *       _id
   *       email
   *     }
   *   }
   */
  @Mutation(() => User)
  updateUser(@Args('updateUserInput') updateUserInput: UpdateUserInput) {
    // Delegate to service with user ID and update data
    return this.usersService.update(updateUserInput.id, updateUserInput);
  }

  /**
   * GraphQL Mutation to delete a user.
   *
   * @param id - The ID of the user to delete
   * @returns The deleted User object (as it was before deletion)
   *
   * Example GraphQL mutation:
   *   mutation {
   *     removeUser(id: 123) {
   *       _id
   *       email
   *     }
   *   }
   */
  @Mutation(() => User)
  removeUser(@Args('id', { type: () => Int }) id: number) {
    // Delegate to service to remove the user
    return this.usersService.remove(id);
  }
}
