"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const config_1 = __importDefault(require("../../config"));
const logger_1 = __importDefault(require("../utils/logger"));
class Database {
    constructor() {
        this.isConnected = false;
        this.handleError = (error) => {
            logger_1.default.error('MongoDB connection error:', error);
        };
        this.handleDisconnected = () => {
            logger_1.default.warn('MongoDB disconnected');
            this.isConnected = false;
        };
        this.handleReconnected = () => {
            logger_1.default.info('MongoDB reconnected');
            this.isConnected = true;
        };
    }
    static getInstance() {
        if (!Database.instance) {
            Database.instance = new Database();
        }
        return Database.instance;
    }
    async connect() {
        if (this.isConnected) {
            logger_1.default.info('Database already connected');
            return;
        }
        try {
            const uri = config_1.default.server.nodeEnv === 'test'
                ? config_1.default.database.mongodb.testUri
                : config_1.default.database.mongodb.uri;
            await mongoose_1.default.connect(uri, config_1.default.database.mongodb.options);
            this.isConnected = true;
            logger_1.default.info(`Connected to MongoDB: ${uri}`);
            mongoose_1.default.connection.on('error', this.handleError);
            mongoose_1.default.connection.on('disconnected', this.handleDisconnected);
            mongoose_1.default.connection.on('reconnected', this.handleReconnected);
        }
        catch (error) {
            logger_1.default.error('Failed to connect to MongoDB:', error);
            throw error;
        }
    }
    async disconnect() {
        if (!this.isConnected) {
            return;
        }
        try {
            await mongoose_1.default.disconnect();
            this.isConnected = false;
            logger_1.default.info('Disconnected from MongoDB');
        }
        catch (error) {
            logger_1.default.error('Error disconnecting from MongoDB:', error);
            throw error;
        }
    }
    isConnectionReady() {
        return this.isConnected && mongoose_1.default.connection.readyState === 1;
    }
    getConnectionState() {
        const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
        return states[mongoose_1.default.connection.readyState] || 'unknown';
    }
    async clearDatabase() {
        if (config_1.default.server.nodeEnv !== 'test') {
            throw new Error('clearDatabase can only be used in test environment');
        }
        const collections = mongoose_1.default.connection.collections;
        for (const key in collections) {
            const collection = collections[key];
            if (collection) {
                await collection.deleteMany({});
            }
        }
        logger_1.default.info('Database cleared');
    }
}
exports.default = Database.getInstance();
//# sourceMappingURL=database.js.map