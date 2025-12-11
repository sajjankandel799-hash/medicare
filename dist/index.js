"use strict";
/**
 * Main entry point for the Hospital Management System
 * This file starts the web server for production deployment
 */
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = require("./web/server");
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;
async function main() {
    try {
        const server = new server_1.WebServer(PORT);
        await server.start();
    }
    catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}
main();
//# sourceMappingURL=index.js.map