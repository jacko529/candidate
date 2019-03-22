import https from 'https';
import express from 'express';

import cors from 'cors';

import { PORT } from './config';

// tslint:disable-next-line:import-name
import formRouter from './Form.controller';

const app: express.Application = express();
// @ts-ignore
const server: https.Server = https.createServer(app);

app.use('/apply', cors());
app.use('/apply', formRouter);

server.listen(PORT, (err: Error) => {
  if (err) {
    throw err;
  }
  // tslint:disable-next-line:no-console
  console.log(`App is listening on port ${PORT}`);
});
