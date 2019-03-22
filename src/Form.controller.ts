import { PassThrough } from 'stream';
import multer from 'multer';
// tslint:disable-next-line:import-name
import axios from 'axios';

// tslint:disable-next-line:import-name
import FormData from 'form-data';
import { RECRUITEE_KEY, OFFERS } from './config';

import { Router, Request, Response } from 'express';

const router = Router();

// Initialise memory storage to receive resumes from form.
const store = multer({ storage: multer.memoryStorage() });

// Set constant for base candidate endpoint url.
const baseCandidateUrl = 'https://api.recruitee.com/c/30789/candidates/';

// Set authorization of axios instance.
const recruitee = axios.create({
  headers: {
    Authorization: `Bearer ${RECRUITEE_KEY}`,
  },
});


/**
  Take form data from apply page and create candidate.
  Params:
    position: string - references the offer id of the position.
  Form data:
    name: string - name of the candidate.
    email: string - email of the candidate.
    link: string - link to relevant projects the candidate worked on (optional).
    message: string - cover letter (optional).
    resume: file - candidate resume.
**/
router.post('/:position', store.single('resume'), async (req: Request, res: Response) => {

  try {

    const position = req.params.position;

    if (!OFFERS.hasOwnProperty(position)) {
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

    // @ts-ignore
    applicationForm.append('offer_id', OFFERS[position]);

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
