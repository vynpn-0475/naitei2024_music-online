import { NextFunction, Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { createAuthor, deleteAuthor, getAuthorById, getAuthors, updateAuthor } from '../services/Author.service';
import { uploadFileToFirebase } from '../utils/fileUpload.utils';
import { Author } from '@src/entities/Author.entity';

export async function validateAndFetchAuthor(req: Request, res: Response, next: NextFunction) {
  const id = parseInt(req.params.id);
  const t = req.t;

  if (isNaN(id)) {
    req.flash('error_msg', t('error.invalidAuthorId'));
    return res.redirect('/error');
  }

  try {
    const author = await getAuthorById(id, t);
    if (author === null) {
      req.flash('error_msg', t('error.authorNotFound'));
      return res.redirect('/error');
    }
    (req as any).author = author;
    next();
  } catch (error) {
    req.flash('error_msg', t('error.failedToFetchAuthor'));
    return res.redirect('/error');
  }
}

export const list = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const t = req.t;
  try {
    const authors = await getAuthors();
    res.render('authors/index', { authors, title: t('authors.authorListTitle') });
  } catch (error) {
    req.flash('error_msg', t('error.failedToFetchAuthors'));
    res.redirect('/error');
  }
});

export const detail = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const t = req.t;
  try {
    const author = await getAuthorById(parseInt(req.params.id, 10), t);
    if (!author) {
      req.flash('error_msg', t('error.authorNotFound'));
      return res.redirect('/error');
    }
    res.render('authors/detail', { 
      author, 
      songs: author.songs,
      title: t('authors.authorDetailTitle') 
    });
  } catch (error) {
    req.flash('error_msg', t('error.failedToFetchAuthor'));
    res.redirect('/error');
  }
});

export const createGet = (req: Request, res: Response) => {
  res.render('authors/create', {
    title: req.t('authors.createAuthor'),
    flashMessages: {
      error_msg: req.flash('error_msg') || null,
      success_msg: req.flash('success_msg') || null,
    },
  });
};

export const createPost = async (req: Request, res: Response) => {
  try {
    const { fullname, dateOfBirth } = req.body;
    let avatarUrl = '';

    const existingAuthor = await Author.findOne({ where: { fullname } });
    if (existingAuthor) {
      req.flash('error_msg', req.t('error.authorAlreadyExists'));
      return res.redirect('/admin/authors/create');
    }

    if (req.file) {
      avatarUrl = await uploadFileToFirebase(req.file.buffer, req.file.originalname, 'author_avatar', req.file.mimetype);
    }

    try {
      const author = await createAuthor({ fullname, avatar: avatarUrl, dateOfBirth: new Date(dateOfBirth) }, req.t);
      res.redirect('/admin/authors');
    } catch (authorError) {
      req.flash('error_msg', req.t('error.failedToCreateAuthor'));
      res.redirect('/admin/authors/create');
    }
  } catch (error) {
    req.flash('error_msg', req.t('error.failedToCreateAuthor', { error: error.message }));
    res.redirect('/admin/authors/create');
  }
};

export const updateGet = async (req: Request, res: Response) => {
  const t = req.t;
  try {
    const author = (req as any).author;
    res.render('authors/update', {
      title: t('authors.updateAuthor'),
      author,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send(t('error.failedToFetchAuthor'));
  }
};

export const updatePost = async (req: Request, res: Response) => {
  const t = req.t;
  try {
    const authorId = parseInt(req.params.id, 10);
    const { fullname, dateOfBirth } = req.body;
    let avatarUrl = '';

    if (req.file) {
      avatarUrl = await uploadFileToFirebase(req.file.buffer, req.file.originalname, 'author_avatar', req.file.mimetype);
    }

    const author = await updateAuthor(authorId, { fullname, avatar: avatarUrl, dateOfBirth: new Date(dateOfBirth) }, t);
    res.redirect(`/admin/authors/${author.id}`);
  } catch (error) {
    console.error(error);
    res.status(500).send(t('error.failedToUpdateAuthor'));
  }
};

export const deleteGet = async (req: Request, res: Response) => {
  const t = req.t;
  try {
    const author = (req as any).author;
    res.render('authors/delete', {
      title: t('authors.deleteAuthor'),
      author,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send(t('error.failedToFetchAuthor'));
  }
};

export const deletePost = async (req: Request, res: Response) => {
  const t = req.t;
  try {
    const authorId = parseInt(req.params.id, 10);
    await deleteAuthor(authorId, t);
    res.redirect('/admin/authors');
  } catch (error) {
    console.error(error);
    res.status(500).send(t('error.failedToDeleteAuthor'));
  }
};
