import { startUdpServer } from './server/server';
const main = async (): Promise<void> => {
  console.log('⏳ Starting dns server ');
  // The server will keep running
  const server = await startUdpServer();

  // Handle graceful shutdown
  const shutdown = () => {
    console.log('⏳ Gracefully shutting down server...');
    server.close(() => {
      console.log('❌ Server closed.');
      process.exit(0);
    });
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
};
main();
