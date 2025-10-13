export declare const database: {
    mongodb: {
        uri: string;
        testUri: string;
        options: {
            maxPoolSize: number;
            serverSelectionTimeoutMS: number;
            socketTimeoutMS: number;
        };
    };
    redis: {
        url: string;
        options: {
            retryDelayOnFailover: number;
            enableReadyCheck: boolean;
            maxRetriesPerRequest: null;
        };
    };
};
export declare const jwt: {
    secret: string;
    expiresIn: string;
    refreshSecret: string;
    refreshExpiresIn: string;
};
export declare const server: {
    port: number;
    nodeEnv: string;
    apiVersion: string;
    apiPrefix: string;
};
export declare const security: {
    bcryptSaltRounds: number;
    sessionSecret: string;
    rateLimitWindowMs: number;
    rateLimitMaxRequests: number;
};
export declare const cors: {
    origin: string;
    credentials: boolean;
};
export declare const logging: {
    level: string;
};
export declare const upload: {
    maxFileSize: number;
    uploadPath: string;
};
declare const _default: {
    database: {
        mongodb: {
            uri: string;
            testUri: string;
            options: {
                maxPoolSize: number;
                serverSelectionTimeoutMS: number;
                socketTimeoutMS: number;
            };
        };
        redis: {
            url: string;
            options: {
                retryDelayOnFailover: number;
                enableReadyCheck: boolean;
                maxRetriesPerRequest: null;
            };
        };
    };
    jwt: {
        secret: string;
        expiresIn: string;
        refreshSecret: string;
        refreshExpiresIn: string;
    };
    server: {
        port: number;
        nodeEnv: string;
        apiVersion: string;
        apiPrefix: string;
    };
    security: {
        bcryptSaltRounds: number;
        sessionSecret: string;
        rateLimitWindowMs: number;
        rateLimitMaxRequests: number;
    };
    cors: {
        origin: string;
        credentials: boolean;
    };
    logging: {
        level: string;
    };
    upload: {
        maxFileSize: number;
        uploadPath: string;
    };
};
export default _default;
//# sourceMappingURL=index.d.ts.map