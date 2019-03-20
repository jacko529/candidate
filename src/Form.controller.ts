// tslint:disable-next-line:import-name
import axios from 'axios';
import fs, { appendFile } from 'fs';
import request from 'request';
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

    const applicationForm = new FormData();
    applicationForm.append('candidate[name]', candidate.name);
    applicationForm.append('candidate[cv]', req.file.buffer, {
      filepath: req.file.path,
      contentType: req.file.mimetype,
    });

    // @ts-ignore
    const response = await recruitee.post(baseCandidateUrl, applicationForm, {
      headers: applicationForm.getHeaders(),
    });

    res.status(200).send(response);
  } catch (err) {
    res.status(err.status || 400).send(err.message || 'Couldn\'t process your request.');
  }
});

export default router;
