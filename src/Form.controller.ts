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

const offerIds = {
  marketing: 252913,
  designer: 249219,
  developer: 252909,
};

/**
  Data received from a form with inputs:
  name: string
  resume: file
**/
router.post('/:position', store.extractResume('resume'), async (req: Request, res: Response) => {

  try {

    if (!offerIds.hasOwnProperty(req.params.position)) {
      throw Error('No such position available.');
    }

    const { name, email, link, message } = req.body;

    if (!!!name || name === '') {
      throw Error('Name is required.');
    }

    if (!!!email || email === '') {
      throw Error('Email is required.');
    }

    if (!!!req.file) {
      throw Error('Resume is required.');
    }

    // Convert buffer into a file stream that can be sent to recruitee.
    const cvStream = new PassThrough();
    cvStream.end(req.file.buffer);

    // Generate form data to be sent.
    const applicationForm = new FormData();
    applicationForm.append('candidate[name]', name);
    applicationForm.append('candidate[emails][]', email);

    if (!!link) {
      applicationForm.append('candidate[links][]', link);
    }

    if (!!message) {
      applicationForm.append('candidate[cover_letter]', message);
    }

    applicationForm.append('candidate[cv]', cvStream, {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
      knownLength: req.file.size,
    });

    // @ts-ignore
    const response = await recruitee.post(baseCandidateUrl, applicationForm, {
      headers: applicationForm.getHeaders(),
    });

    // Uncomment when testing to avoid cluttering the candidates pool.
    // await recruitee.delete(`${baseCandidateUrl}${response.data.candidate.id}`);

    res.status(response.status).send(response.data);
  } catch (err) {
    res.status(400).send(err.message || 'Couldn\'t process your request.');
  }
});

export default router;
