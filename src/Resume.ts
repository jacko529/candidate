import path from 'path';

import multer from 'multer';
import { Request, RequestHandler } from 'express';

export default class Resume {

  private upload: multer.Instance;

  public constructor() {

    const storage: multer.StorageEngine = multer.memoryStorage();

    this.upload = multer({ storage });
  }

  public extractResume(inputName: string): RequestHandler {
    return this.upload.single(inputName);
  }
}
