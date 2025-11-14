import test, { describe, mock, afterEach } from 'node:test';
import assert from 'node:assert';
import { startUdpServer } from '../server/server';
describe('Server Tests', () => {
  let server: import('dgram').Socket;
  afterEach(() => {
    if (server) {
      server.close();
    }
  });
  test('the server runs, and shows its bound to the port', async () => {
    //spy on the console to check the messaging
    const consoleLogMock = mock.method(console, 'log');
    server = await startUdpServer();
    assert.equal(
      consoleLogMock.mock.calls[0].arguments[0],
      '✅ Server bound to port 53'
    );
  });
});
