import * as express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import Engine from './app/engine';
import Store from './app/store';
import { join } from 'path';

const app = express();

app.use(express.static(join(__dirname, 'assets')));

const server = createServer(app);

new Engine(
  new Server(server, {
    cors: {
      origin: '*',
      methods: '*',
    },
  }),
  new Store()
).start();

const port = process.env.PORT || 3333;

server.listen(port, () => {
  console.log(`Listening on :${port}`);
});

server.on('error', console.error);
