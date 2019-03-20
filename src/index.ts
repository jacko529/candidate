import express from 'express';
import bodyParser from 'body-parser';

import { PORT } from './config';

// tslint:disable-next-line:import-name
import formRouter from './Form.controller';

const app: express.Application = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use('/apply', formRouter);

app.listen(PORT, (err: Error) => {
  if (err) {
    throw err;
  }
  // tslint:disable-next-line:no-console
  console.log(`App is listening on port ${PORT}`);
});
