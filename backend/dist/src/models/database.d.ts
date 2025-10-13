declare class Database {
    private static instance;
    private isConnected;
    private constructor();
    static getInstance(): Database;
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    isConnectionReady(): boolean;
    getConnectionState(): string;
    private handleError;
    private handleDisconnected;
    private handleReconnected;
    clearDatabase(): Promise<void>;
}
declare const _default: Database;
export default _default;
//# sourceMappingURL=database.d.ts.map