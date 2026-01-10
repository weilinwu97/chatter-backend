import { Logger, NotFoundException } from '@nestjs/common';
import { AbstractDocument } from './abstract.schema';
import { Model, Types, QueryFilter, UpdateQuery } from 'mongoose';

/**
 * Abstract base class for database repositories using MongoDB and Mongoose.
 *
 * This class provides common CRUD (Create, Read, Update, Delete) operations that can be
 * reused across all entities in your application. By extending this class, you get
 * standard database methods without having to rewrite them for each entity.
 *
 * @template TDocument - The type of document this repository manages (must extend AbstractDocument).
 *                       Example: User, Post, Comment, etc.
 *
 * @example
 * // Create a concrete repository for User entity
 * @Injectable()
 * export class UsersRepository extends AbstractRepository<User> {
 *   protected readonly logger = new Logger(UsersRepository.name);
 *
 *   constructor(@InjectModel(User.name) userModel: Model<User>) {
 *     super(userModel);
 *   }
 *
 *   // Add custom methods specific to users
 *   async findByEmail(email: string) {
 *     return this.model.findOne({ email }).lean();
 *   }
 * }
 */
export abstract class AbstractRepository<TDocument extends AbstractDocument> {
  /**
   * Logger instance for this repository.
   *
   * - 'protected' = accessible in this class and child classes only
   * - 'abstract' = child classes MUST provide their own logger implementation
   * - 'readonly' = cannot be reassigned after initialization
   *
   * Each concrete repository should implement this with its own name for better debugging:
   * protected readonly logger = new Logger(UsersRepository.name);
   */
  protected abstract readonly logger: Logger;

  /**
   * Constructor that receives the Mongoose model for this repository.
   *
   * @param model - The Mongoose model for performing database operations
   *
   * TypeScript Parameter Properties Shorthand:
   * By adding 'protected readonly' before the parameter, TypeScript automatically:
   * 1. Creates a class property named 'model'
   * 2. Assigns the constructor parameter to that property
   * 3. Makes it accessible to child classes but not from outside
   * 4. Prevents reassignment after initialization
   *
   * This is equivalent to:
   *   protected readonly model: Model<TDocument>;
   *   constructor(model: Model<TDocument>) {
   *     this.model = model;
   *   }
   */
  constructor(protected readonly model: Model<TDocument>) {}

  /**
   * Creates and saves a new document to the database with an auto-generated MongoDB ObjectId.
   *
   * @param document - The document data without an _id field (e.g., { email: 'test@example.com', password: 'hash' })
   * @returns The saved document as a plain object including the generated _id
   *
   * Key Concepts:
   * - Omit<TDocument, '_id'> = TypeScript utility type that creates a new type from TDocument
   *                             but excludes the '_id' field
   *                             (user provides data, but not the ID - we generate it)
   * - Types.ObjectId() = Generates a unique MongoDB identifier (12-byte hexadecimal string)
   * - toJSON() = Converts Mongoose document to plain JavaScript object
   * - 'as unknown as TDocument' = TypeScript type casting (two-step cast for complex types)
   */
  async create(document: Omit<TDocument, '_id'>): Promise<TDocument> {
    // Create a new Mongoose document instance (not saved to DB yet)
    const createdDocument = new this.model({
      ...document, // Spread operator: copies all properties from input (email, password, etc.)
      _id: new Types.ObjectId(), // Generate a unique MongoDB ID
    });

    // Save to database, convert to plain object, and return
    // - save() = Persists the document to MongoDB
    // - toJSON() = Removes Mongoose methods, returns plain data
    // - Type casting ensures TypeScript knows the return type
    return (await createdDocument.save()).toJSON() as unknown as TDocument;
  }

  /**
   * Finds a single document matching the filter criteria.
   *
   * @param filterQuery - MongoDB query filter to find the document.
   *                      Example: { email: 'test@example.com' } or { _id: someId }
   * @returns The found document as a plain JavaScript object
   * @throws NotFoundException if no document matches the filter
   *
   * Key Concepts:
   * - findOne() = Mongoose method that finds the first document matching the filter
   * - lean() = Returns a plain JavaScript object instead of a Mongoose document
   *            (faster and lighter, but without Mongoose methods like .save())
   * - await = Pauses execution until the database query completes
   */
  async findOne(filterQuery: QueryFilter<TDocument>): Promise<TDocument> {
    // Query the database for a single document matching the filter
    const document = await this.model.findOne(filterQuery).lean<TDocument>();

    // Check if document was found
    if (!document) {
      // Log a warning for debugging purposes
      this.logger.warn(
        'Document was not found with filterQuery: ',
        filterQuery,
      );
      // Throw an HTTP exception that NestJS will convert to a 404 response
      throw new NotFoundException('Document not found');
    }

    return document;
  }

  /**
   * Finds a single document and updates it atomically.
   *
   * @param filterQuery - MongoDB query filter to find the document to update.
   *                      Example: { _id: userId }
   * @param update - The update operations to apply.
   *                 Example: { email: 'new@example.com' } or { $set: { status: 'active' } }
   * @returns The updated document as a plain JavaScript object
   * @throws NotFoundException if no document matches the filter
   *
   * Key Concepts:
   * - findOneAndUpdate() = Mongoose method that finds and updates in a single atomic operation
   * - { new: true } = Option that returns the UPDATED document (not the original)
   *                   Without this, it would return the document before the update
   * - Atomic operation = The find and update happen together without other operations in between
   *                      (prevents race conditions)
   */
  async findOneAndUpdate(
    filterQuery: QueryFilter<TDocument>,
    update: UpdateQuery<TDocument>,
  ): Promise<TDocument> {
    // Find and update the document in one atomic operation
    const document = await this.model
      .findOneAndUpdate(
        filterQuery, // What to find
        update, // What to update
        {
          new: true, // Return the updated document (not the old one)
        },
      )
      .lean<TDocument>(); // Convert to plain JavaScript object

    // Check if document was found and updated
    if (!document) {
      this.logger.warn(
        'Document was not found with filterQuery: ',
        filterQuery,
      );
      throw new NotFoundException('Document not found');
    }

    return document;
  }

  /**
   * Finds all documents matching the filter criteria.
   *
   * @param filterQuery - MongoDB query filter to find documents.
   *                      Example: { status: 'active' } or {} for all documents
   * @returns An array of matching documents as plain JavaScript objects
   *
   * Key Concepts:
   * - find() = Mongoose method that returns ALL documents matching the filter
   * - TDocument[] = TypeScript array type notation (array of TDocument)
   * - Empty filter {} = Returns all documents in the collection
   *
   * Note: Unlike findOne, this doesn't throw an error if nothing is found.
   * It simply returns an empty array [].
   */
  async find(filterQuery: QueryFilter<TDocument>): Promise<TDocument[]> {
    // Query the database for all matching documents and return as plain objects
    return this.model.find(filterQuery).lean<TDocument[]>();
  }

  /**
   * Finds a single document and deletes it atomically.
   *
   * @param filterQuery - MongoDB query filter to find the document to delete.
   *                      Example: { _id: userId }
   * @returns The deleted document as a plain JavaScript object (what it was before deletion)
   * @throws NotFoundException if no document matches the filter
   *
   * Key Concepts:
   * - findOneAndDelete() = Mongoose method that finds and deletes in a single atomic operation
   * - Returns the document BEFORE deletion (useful for logging or undo functionality)
   * - Atomic operation = The find and delete happen together without other operations in between
   *
   * Use Case: When you want to delete a document and also need to know what was deleted
   * (e.g., for audit logs or to return the deleted data in the API response)
   */
  async findOneAndDelete(
    filterQuery: QueryFilter<TDocument>,
  ): Promise<TDocument> {
    // Find and delete the document in one atomic operation
    const document = await this.model
      .findOneAndDelete(filterQuery)
      .lean<TDocument>(); // Convert to plain JavaScript object

    // Check if document was found and deleted
    if (!document) {
      this.logger.warn(
        'Document was not found with filterQuery: ',
        filterQuery,
      );
      throw new NotFoundException('Document not found');
    }

    // Return the document as it was before deletion
    return document;
  }
}
