import express from 'express';

import cors from 'cors';

import { PORT } from './config';

// tslint:disable-next-line:import-name
import formRouter from './createCandidate';

const app: express.Application = express();

app.use('/apply', cors());
app.use('/apply', formRouter);

app.listen(PORT, (err: Error) => {
  if (err) {
    throw err;
  }
  // tslint:disable-next-line:no-console
  console.log(`App is listening on port ${PORT}`);
});
