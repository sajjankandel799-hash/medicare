#!/usr/bin/env node

/**
 * Hospital Management System CLI Entry Point
 * 
 * This file serves as the main entry point for the CLI application.
 * Run with: npm run cli or node dist/cli.js
 */

import { startCLI } from './cli/index';

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
startCLI().catch((error: Error) => {
  console.error('❌ CLI application failed to start:', error.message);
  process.exit(1);
});