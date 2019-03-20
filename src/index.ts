import express from 'express';

import { PORT, RECRUITEE_KEY } from './config';

const app: express.Application = express();


app.listen(PORT, (err: Error) => {
  if (err) {
    throw err;
  }
  console.log(`App is listening on port ${PORT}`);
});
