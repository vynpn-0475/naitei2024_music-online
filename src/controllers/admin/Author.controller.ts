import { NextFunction, Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import {
  createAuthor,
  deleteAuthor,
  getAuthorById,
  getAuthorsPage,
  updateAuthor,
} from '../../services/Author.service';
import { Author } from '@src/entities/Author.entity';
import { uploadFileToFirebase } from '@src/utils/fileUpload.utils';
import {
  countSongsByAuthorId,
  getSongsByAuthorId,
} from '@src/services/Song.service';
import { Change } from '@src/constants/change';

export async function validateAndFetchAuthor(
  req: Request,
  res: Response,
  next: NextFunction
) {
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

export const list = asyncHandler(async (req: Request, res: Response) => {
  const t = req.t;
  const page = parseInt(req.query.page as string, 10) || 1;
  const pageSize = 5;

  try {
    const { authors, total } = await getAuthorsPage(page, pageSize);
    const totalPages = Math.ceil(total / pageSize);

    if (!authors.length) {
      req.flash('error_msg', t('error.noAuthors'));
      return res.render('authors/index', {
        authors: [],
        title: t('authors.authorListTitle'),
        currentPage: page,
        totalPages,
      });
    }

    res.render('authors/index', {
      authors,
      title: t('authors.authorListTitle'),
      currentPage: page,
      totalPages,
    });
  } catch (error) {
    req.flash('error_msg', t('error.failedToFetchAuthors'));
    res.redirect('/error');
  }
});

export const detail = asyncHandler(async (req: Request, res: Response) => {
  const t = req.t;
  try {
    const author = await getAuthorById(parseInt(req.params.id, 10), t);
    if (!author) {
      req.flash('error_msg', t('error.authorNotFound'));
      return res.redirect('/error');
    }
    const count = await countSongsByAuthorId(req, author.id);
    const songs = await getSongsByAuthorId(req, author.id);
    if (count === 0) {
      req.flash('error_msg', t('error.songNotFound'));
      return res.render('authors/detail', {
        author,
        songs,
        count,
        title: t('authors.authorDetailTitle'),
      });
    }
    res.render('authors/detail', {
      author,
      songs,
      count,
      title: t('authors.authorDetailTitle'),
    });
  } catch (error) {
    req.flash('error_msg', t('error.failedToFetchAuthor'));
    res.redirect('/error');
  }
});

export const createGet = (req: Request, res: Response) => {
  res.render('authors/create', {
    title: req.t('authors.createAuthor'),
  });
};

export const createPost = async (req: Request, res: Response) => {
  try {
    const { fullname, bio, dateOfBirth } = req.body;
    let avatarUrl = '';

    const existingAuthor = await Author.findOne({ where: { fullname } });
    if (existingAuthor) {
      req.flash('error_msg', req.t('error.authorAlreadyExists'));
      return res.redirect('/admin/authors/create');
    }

    if (req.file) {
      const url = await uploadFileToFirebase(
        req.file.buffer,
        req.file.originalname,
        'author_avatar',
        req.file.mimetype
      );
      if (avatarUrl !== null) {
        avatarUrl = url;
      } else {
        avatarUrl = Change.imageUrl;
      }
    }

    await createAuthor(
      { fullname, avatar: avatarUrl, bio, dateOfBirth: new Date(dateOfBirth) },
      req.t
    );
    req.flash('success_msg', req.t('authors.authorCreated'));
    res.redirect('/admin/authors');
  } catch (error) {
    req.flash('error_msg', req.t('error.failedToCreateAuthor'));
    res.redirect('/admin/authors/create');
  }
};

export const updateGet = (req: Request, res: Response) => {
  const t = req.t;
  const author = (req as any).author;
  if (!author) {
    req.flash('error_msg', t('error.authorNotFound'));
    return res.redirect('/admin/authors');
  }
  res.render('authors/update', {
    title: t('authors.updateAuthor'),
    author,
  });
};

export const updatePost = async (req: Request, res: Response) => {
  const t = req.t;
  try {
    const authorId = parseInt(req.params.id, 10);
    const { fullname, bio, dateOfBirth } = req.body;

    const author = await getAuthorById(authorId, t);
    if (!author) {
      req.flash('error_msg', t('authors.authorNotFound'));
      return res.redirect(`/admin/authors/update/${authorId}`);
    }

    let avatarUrl = author.avatar;

    if (req.file) {
      avatarUrl = await uploadFileToFirebase(
        req.file.buffer,
        req.file.originalname,
        'author_avatar',
        req.file.mimetype
      );
    }

    await updateAuthor(
      authorId,
      {
        fullname: fullname || author.fullname,
        avatar: avatarUrl,
        bio,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : author.dateOfBirth,
      },
      t
    );

    req.flash('success_msg', t('authors.authorUpdated'));
    res.redirect(`/admin/authors/${authorId}`);
  } catch (error) {
    req.flash('error_msg', t('error.failedToUpdateAuthor'));
    res.redirect(`/admin/authors/update/${req.params.id}`);
  }
};

export const deleteGet = (req: Request, res: Response) => {
  const t = req.t;

  try {
    const author = (req as any).author;

    if (!author) {
      req.flash('error_msg', t('error.noAlbums'));
      return res.redirect('/admin/authors');
    }

    res.render('authors/delete', {
      title: t('authors.deleteAuthor'),
      author,
    });
  } catch (error) {
    req.flash('error_msg', t('error.failedToFetchAuthor'));
    res.redirect('/admin/authors');
  }
};

export const deletePost = async (req: Request, res: Response) => {
  const t = req.t;
  const { id } = req.params;

  try {
    const author = (req as any).author;

    if (!author) {
      req.flash('error_msg', t('error.authorNotFound'));
      return res.redirect('/admin/authors');
    }

    if (author.songs.length > 0) {
      req.flash('error_msg', t('warning.authorHasSongs'));
      return res.redirect(`/admin/authors/delete/${id}`);
    }

    await deleteAuthor(author.id, t);
    req.flash('success_msg', t('success.authorDeleted'));
    res.redirect('/admin/authors');
  } catch (error) {
    req.flash('error_msg', t('error.failedToDeleteAuthor'));
    res.redirect(`/admin/authors/delete/${id}`);
  }
};
