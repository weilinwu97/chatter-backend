import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AbstractEntity } from 'src/common/database/abstract.entity';

/**
 * User Entity - Represents a user in the system.
 *
 * This class defines the structure of a User document in MongoDB and also serves as
 * the GraphQL type for querying users. It inherits the _id field from AbstractEntity.
 *
 * Decorators explained:
 * - @Schema() = Tells Mongoose this class represents a MongoDB collection
 *   - versionKey: false = Disables the __v field that Mongoose adds by default for tracking document versions
 * - @ObjectType() = Tells GraphQL this class can be returned as a type in queries/mutations
 *
 * Key Concepts:
 * - Extends AbstractEntity = Inherits the _id field (MongoDB's unique identifier)
 * - Dual purpose = Works as both a database schema AND a GraphQL type definition
 */
@Schema({ versionKey: false })
@ObjectType()
export class User extends AbstractEntity {
  /**
   * User's email address.
   *
   * Decorators:
   * - @Prop() = Tells Mongoose this is a database field
   * - @Field() = Tells GraphQL this field can be queried/returned
   *
   * Note: Both decorators are needed because this class serves dual purposes
   * (database model AND GraphQL type)
   */
  @Prop()
  @Field()
  email: string;

  /**
   * User's hashed password.
   *
   * Security Note:
   * - Only has @Prop() decorator (not @Field())
   * - This means it's stored in the database but NOT exposed in GraphQL queries
   * - Keeps passwords hidden from API responses for security
   */
  @Prop()
  password: string;
}

/**
 * Mongoose Schema for the User entity.
 *
 * SchemaFactory.createForClass() converts our TypeScript class into a Mongoose schema
 * that MongoDB can understand and use for validation, indexing, and querying.
 *
 * This schema is registered with Mongoose in the UsersModule.
 */
export const UserSchema = SchemaFactory.createForClass(User);
