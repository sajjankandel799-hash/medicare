#!/usr/bin/env node

/**
 * Hospital Management System Web Interface Entry Point
 * 
 * This file serves as the main entry point for the web interface.
 * Run with: npm run web
 */

import { WebServer } from './web/server';

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n👋 Shutting down web server...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n\n👋 System shutdown requested. Goodbye!');
  process.exit(0);
});

// Start the web server
const server = new WebServer(3000);
server.start().catch((error: Error) => {
  console.error('❌ Web server failed to start:', error.message);
  process.exit(1);
});