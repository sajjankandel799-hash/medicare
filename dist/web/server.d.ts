/**
 * Web Server for Hospital Management System
 * Provides a REST API and serves the web interface
 */
export declare class WebServer {
    private app;
    private services;
    private authService;
    private port;
    constructor(port?: number);
    private setupMiddleware;
    private setupRoutes;
    private authenticateToken;
    private createApiRouter;
    start(): Promise<void>;
}
//# sourceMappingURL=server.d.ts.map