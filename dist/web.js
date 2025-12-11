"use strict";
/**
 * Web server entry point for development
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
//# sourceMappingURL=web.js.map