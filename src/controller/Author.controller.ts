import { Request, Response } from 'express';
import { createAuthor } from '../services/Author.service';
import { uploadFileToFirebase } from '../utils/fileUpload.utils';

export const createGet = (req: Request, res: Response) => {
  res.render('authors/create', {
    title: 'Create Author',
  });
};

export const createPost = async (req: Request, res: Response) => {
  try {
    const { fullname, dateOfBirth } = req.body;
    let avatarUrl = '';

    if (req.file) {
      avatarUrl = await uploadFileToFirebase(req.file.buffer, req.file.originalname, 'author_avatar', req.file.mimetype);
    } 

    try {
      const author = await createAuthor({ fullname, avatar: avatarUrl, dateOfBirth: new Date(dateOfBirth) });
      res.redirect(`/admin/genres`);
    } catch (authorError) {
      throw new Error('Error creating author');
    }
  } catch (error) {
    res.status(500).send(`Error creating author: ${error.message}`);
  }
};
