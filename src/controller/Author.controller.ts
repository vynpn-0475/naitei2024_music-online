import { NextFunction, Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { createAuthor, getAuthorById, getAuthors } from '../services/Author.service';
import { uploadFileToFirebase } from '../utils/fileUpload.utils';

export async function validateAndFetchAuthor(req: Request, res: Response, next: NextFunction) {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
      req.flash('error_msg', req.t('invalidAuthorId'));
      return res.redirect('/error');
  }
  const author = await getAuthorById(id);
  if (author === null) {
      req.flash('error_msg', req.t('authorNotFound'));
      return res.redirect('/error');
  }
  (req as any).author = author;
  next();
}

export const list = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
      const authors = await getAuthors();
      res.render('authors/index', { authors, title: 'List Author' });
  } catch (error) {
      req.flash('error_msg', 'failedToFetchAuthors');
      res.redirect('/error'); 
  }
});

export const detail = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
      const author = (req as any).author;
      res.render('authors/detail', { author, title: 'Author Detail' });
  } catch (error) {
      req.flash('error_msg', 'failedToFetchAuthor');
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
