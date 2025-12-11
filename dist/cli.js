#!/usr/bin/env node
"use strict";
/**
 * Hospital Management System CLI Entry Point
 *
 * This file serves as the main entry point for the CLI application.
 * Run with: npm run cli or node dist/cli.js
 */
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("./cli/index");
// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n\n👋 Goodbye!');
    process.exit(0);
});
process.on('SIGTERM', () => {
    console.log('\n\n👋 System shutdown requested. Goodbye!');
    process.exit(0);
});
// Start the CLI application
(0, index_1.startCLI)().catch((error) => {
    console.error('❌ CLI application failed to start:', error.message);
    process.exit(1);
});
//# sourceMappingURL=cli.js.map