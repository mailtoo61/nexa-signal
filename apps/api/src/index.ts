import { createServer } from './server/createServer.js';

const server = createServer();
void server.listen({ port: 3001, host: '0.0.0.0' });
