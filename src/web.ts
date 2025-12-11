/**
 * Web server entry point for development
 */

import { WebServer } from './web/server';

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

async function main() {
  try {
    const server = new WebServer(PORT);
    await server.start();
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

main();