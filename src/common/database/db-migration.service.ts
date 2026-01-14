import { Injectable, OnModuleInit } from '@nestjs/common';

/**
 * DATABASE MIGRATIONS - Summary & Purpose
 *
 * What are database migrations?
 * - Version-controlled scripts that track and apply incremental changes to database schema/structure
 * - Each migration represents a specific change (e.g., creating tables, adding indexes, modifying columns)
 * - Migrations run in order and are tracked to ensure they only execute once
 *
 * Why are migrations needed?
 * 1. Schema Evolution: Safely modify database structure as application evolves without manual SQL
 * 2. Consistency: Ensures all environments (dev, staging, prod) have identical database structure
 * 3. Collaboration: Team members automatically get latest schema changes when pulling code
 * 4. Rollback Safety: Can revert changes if issues occur (via down migrations)
 * 5. Deployment Automation: Database updates happen automatically during deployment
 * 6. Audit Trail: Complete history of all database changes with timestamps and descriptions
 *
 * This service runs migrations automatically on application startup using migrate-mongo.
 */
@Injectable()
export class DBMigrationService implements OnModuleInit {
  // This method runs every time the app starts
  async onModuleInit() {
    // Use dynamic import to handle ESM module
    const migrateMongo = await import('migrate-mongo');
    // migrate-mongo will automatically read migrate-mongo-config.js from the project root
    const { db, client } = await migrateMongo.database.connect();
    await migrateMongo.up(db, client);
    await client.close();
  }
}
