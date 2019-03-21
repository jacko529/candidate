import { PassThrough } from 'stream';
// tslint:disable-next-line:import-name
import axios from 'axios';
// tslint:disable-next-line:import-name
import FormData from 'form-data';
import { RECRUITEE_KEY } from './config';

import { Router, Request, Response } from 'express';
import Resume from './Resume';

const router = Router();
const store = new Resume();

const baseCandidateUrl = 'https://api.recruitee.com/c/30789/candidates/';
const recruitee = axios.create({
  headers: {
    Authorization: `Bearer ${RECRUITEE_KEY}`,
  },
});

/**
  Data received from a form with inputs:
  firstName: string
  lastName: string
  resume: file
**/
router.post('/developer', store.extractResume('resume'), async (req: Request, res: Response) => {

  const candidate = {
    name: `${req.body.firstName} ${req.body.lastName}`,
  };

  try {

    // Convert buffer into a file stream that can be sent to recruitee.
    const cvStream = new PassThrough();
    cvStream.end(req.file.buffer);

    // Generate form data to be sent.
    const applicationForm = new FormData();
    applicationForm.append('candidate[name]', candidate.name);
    applicationForm.append('candidate[cv]', cvStream, {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
      knownLength: req.file.size,
    });

    // @ts-ignore
    const response = await recruitee.post(baseCandidateUrl, applicationForm, {
      headers: applicationForm.getHeaders(),
    });

    res.status(response.status).send(response.data);
  } catch (err) {
    res.status(400).send(err.message || 'Couldn\'t process your request.');
  }
});

export default router;
