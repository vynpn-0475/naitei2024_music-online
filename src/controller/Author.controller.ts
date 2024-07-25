import { NextFunction, Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { createAuthor, getAuthors } from '../services/Author.service';
import { uploadFileToFirebase } from '../utils/fileUpload.utils';

export const list = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
      const authors = await getAuthors();
      res.render('authors/index', { authors, title: 'List Author' });
  } catch (error) {
      req.flash('error_msg', 'failedToFetchAuthors');
      res.redirect('/error'); 
  }
});

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
      res.redirect(`/admin/authors`);
    } catch (authorError) {
      throw new Error('Error creating author');
    }
  } catch (error) {
    res.status(500).send(`Error creating author: ${error.message}`);
  }
};
