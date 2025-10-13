import mongoose from 'mongoose';
import config from '../../config';
import logger from '../utils/logger';

/**
 * Database connection class
 */
class Database {
  private static instance: Database;
  private isConnected: boolean = false;

  private constructor() {}

  /**
   * Get singleton instance
   */
  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  /**
   * Connect to MongoDB
   */
  public async connect(): Promise<void> {
    if (this.isConnected) {
      logger.info('Database already connected');
      return;
    }

    try {
      const uri = config.server.nodeEnv === 'test' 
        ? config.database.mongodb.testUri 
        : config.database.mongodb.uri;

      await mongoose.connect(uri, config.database.mongodb.options);

      this.isConnected = true;
      logger.info(`Connected to MongoDB: ${uri}`);

      // Handle connection events
      mongoose.connection.on('error', this.handleError);
      mongoose.connection.on('disconnected', this.handleDisconnected);
      mongoose.connection.on('reconnected', this.handleReconnected);

    } catch (error) {
      logger.error('Failed to connect to MongoDB:', error);
      throw error;
    }
  }

  /**
   * Disconnect from MongoDB
   */
  public async disconnect(): Promise<void> {
    if (!this.isConnected) {
      return;
    }

    try {
      await mongoose.disconnect();
      this.isConnected = false;
      logger.info('Disconnected from MongoDB');
    } catch (error) {
      logger.error('Error disconnecting from MongoDB:', error);
      throw error;
    }
  }

  /**
   * Check if database is connected
   */
  public isConnectionReady(): boolean {
    return this.isConnected && mongoose.connection.readyState === 1;
  }

  /**
   * Get connection state
   */
  public getConnectionState(): string {
    const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
    return states[mongoose.connection.readyState] || 'unknown';
  }

  /**
   * Handle connection errors
   */
  private handleError = (error: Error): void => {
    logger.error('MongoDB connection error:', error);
  };

  /**
   * Handle disconnection
   */
  private handleDisconnected = (): void => {
    logger.warn('MongoDB disconnected');
    this.isConnected = false;
  };

  /**
   * Handle reconnection
   */
  private handleReconnected = (): void => {
    logger.info('MongoDB reconnected');
    this.isConnected = true;
  };

  /**
   * Clear database (for testing purposes)
   */
  public async clearDatabase(): Promise<void> {
    if (config.server.nodeEnv !== 'test') {
      throw new Error('clearDatabase can only be used in test environment');
    }

    const collections = mongoose.connection.collections;
    
    for (const key in collections) {
      const collection = collections[key];
      if (collection) {
        await collection.deleteMany({});
      }
    }
    
    logger.info('Database cleared');
  }
}

export default Database.getInstance();