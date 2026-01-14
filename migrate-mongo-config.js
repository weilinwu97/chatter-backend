// migrate-mongo configuration file
// This file is automatically loaded by migrate-mongo
module.exports = {
  mongodb: {
    url: process.env.MONGODB_URI || 'mongodb://localhost:27017',
    databaseName: process.env.DB_NAME || 'chatter',
  },
  migrationsDir: 'dist/migrations',
  changelogCollectionName: 'changelog',
  migrationFileExtension: '.js',
};
