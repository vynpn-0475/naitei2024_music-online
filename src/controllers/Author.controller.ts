import { NextFunction, Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { createAuthor, deleteAuthor, getAuthorById, getAuthors, updateAuthor } from '../services/Author.service';
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

export const updateGet = async (req: Request, res: Response) => {
  try {
    const author = (req as any).author;
    res.render('authors/update', {
      title: 'Update Author',
      author,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching author');
  }
};

export const updatePost = async (req: Request, res: Response) => {
  try {
    const authorId = parseInt(req.params.id, 10);
    const { fullname, dateOfBirth } = req.body;
    let avatarUrl = '';
    
    if (req.file) {
      avatarUrl = await uploadFileToFirebase(req.file.buffer, req.file.originalname, 'songs', req.file.mimetype);
    } 

    const author = await updateAuthor(authorId, { fullname, avatar: avatarUrl, dateOfBirth: new Date(dateOfBirth) });
    res.redirect(`/admin/authors/${author.id}`);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error updating author');
  }
};

export const deleteGet = async (req: Request, res: Response) => {
  try {
    const author = (req as any).author;
    res.render('authors/delete', {
      title: 'Delete Author',
      author,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching author');
  }
};

export const deletePost = async (req: Request, res: Response) => {
  try {
    const authorId = parseInt(req.params.id, 10);
    await deleteAuthor(authorId);
    res.redirect('/admin/authors');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error deleting author');
  }
};
