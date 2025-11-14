import dgram from 'dgram';
import { handleBuffers } from './handleBuffers';

// constants
const DNS_PORT = 53;
const UPSTREAM_DNS_RESOLVER = '8.8.8.8'; // Google Public DNS

export const startUdpServer = async (): Promise<dgram.Socket> => {
  const server = dgram.createSocket('udp4');
  // returns the server after setup
  return new Promise((resolve, reject) => {
    server.on('connect', () => {
      console.log('Server connected');
    });
    server.bind(DNS_PORT, () => {
      console.log(`✅ Server bound to port ${DNS_PORT}`);
      resolve(server);
    });
    server.on('message', (message, returnInformation) => {
      // Handle incoming messages
      //   console.log('Message received', handleBuffers(msg));
      const client = dgram.createSocket('udp4');

      // forward the dns query to upstream dns server
      client.send(message, DNS_PORT, UPSTREAM_DNS_RESOLVER, (error) => {
        if (error) {
          console.error('Error forwarding DNS query:', error);
          client.close();
        }
      });

      // listen for the response from the upstream dns server
      client.on('message', (response) => {
        console.log(
          'Response received from upstream DNS server',
          handleBuffers(response)
        );
        // send the response back to the original client
        server.send(
          response,
          0,
          response.length,
          returnInformation.port,
          returnInformation.address,
          (err) => {
            if (err) {
              console.error('Error sending response back to client:', err);
            }
            client.close();
          }
        );
      });
      client.on('error', (err) => {
        console.error('Client error:', err);
        client.close();
      });
    });
  });
};
