import { Request, Response, NextFunction } from 'express';
import asyncHandler from 'express-async-handler';
import {
  createSong,
  deleteSong,
  getSongById,
  getSongsPage,
  updateSong,
  updateSongGenres,
} from '@src/services/Song.service';
import { getAuthorById, getAuthors } from '@src/services/Author.service';
import { uploadFileToFirebase } from '@src/utils/fileUpload.utils';
import { Song } from '@src/entities/Song.entity';
import { SongStatus } from '@src/enums/SongStatus.enum';
import { getGenres, getGenresByIds } from '@src/services/Genre.service';
import { PAGE_SIZE_SONG } from '../../constants/const';

export const validateAndFetchSong = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    req.flash('error_msg', req.t('error.invalidSongId'));
    return res.redirect('/error');
  }
  try {
    const song = await getSongById(req, id);
    if (song === null) {
      req.flash('error_msg', req.t('error.songNotFound'));
      return res.redirect('/error');
    }
    (req as any).song = song;
    next();
  } catch (error) {
    req.flash('error_msg', req.t('error.failedToFetchSongs'));
    res.redirect('/error');
  }
};

export const list = asyncHandler(async (req: Request, res: Response) => {
  const t = req.t;
  const page = parseInt(req.query.page as string, 10) || 1;
  const pageSize = PAGE_SIZE_SONG;
  const query = (req.query.query as string) || '';

  try {
    const { songs, total } = await getSongsPage(
      page,
      pageSize,
      'title',
      'ASC',
      query
    );
    const totalPages = Math.ceil(total / pageSize);
    const currentPage = Math.max(1, Math.min(page, totalPages));

    res.render('songs/index', {
      songs,
      title: t('songs.list.title'),
      currentPage,
      totalPages,
      currentStatus: SongStatus.Deleted,
      baseUrl: '/admin/musics',
      query,
      noSongsMessage: !songs.length
        ? req.t('songs.list.noMatchingSongs')
        : null,
    });
  } catch (error) {
    req.flash('error_msg', req.t('error.failedToFetchSongs'));
    res.redirect('/error');
  }
});

export const detail = asyncHandler((req: Request, res: Response) => {
  try {
    const song = (req as any).song;
    res.render('songs/detail', {
      song,
      currentStatus: SongStatus.Deleted,
      title: req.t('songs.detail.title'),
    });
  } catch (error) {
    req.flash('error_msg', req.t('error.failedToFetchSong'));
    res.redirect('/error');
  }
});

export const createGet = asyncHandler(async (req: Request, res: Response) => {
  try {
    const authors = await getAuthors();
    const genres = await getGenres();
    const songStatus = Object.values(SongStatus);
    res.render('songs/create', {
      authors,
      genres,
      currentStatus: SongStatus.Publish,
      songStatus,
      title: req.t('songs.createSong.title'),
    });
  } catch (error) {
    req.flash('error_msg', req.t('error.failedToFetchAuthors'));
    res.redirect('/error');
  }
});

export const createPost = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { title, genresIds, authorId, lyrics, status } = req.body;
    let imageUrl = '';
    let url = '';

    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    if (files?.['image']?.[0]) {
      const image = files['image'][0];
      imageUrl = await uploadFileToFirebase(
        image.buffer,
        image.originalname,
        'musics/images',
        image.mimetype
      );
    }

    if (files?.['song']?.[0]) {
      const song = files['song'][0];
      url = await uploadFileToFirebase(
        song.buffer,
        song.originalname,
        'musics/songs',
        song.mimetype
      );
    }

    const author = await getAuthorById(authorId, req.t);
    if (!author) {
      throw new Error(req.t('error.authorNotFound'));
    }

    const genres = await getGenresByIds(genresIds);
    await createSong(req, {
      title,
      artist: author.id.toString(),
      lyrics,
      imageUrl,
      url,
      status,
      author,
      genres,
    });
    res.redirect('/admin/musics');
  } catch (error) {
    req.flash('error_msg', req.t('error.failedToCreateSong'));
    res
      .status(500)
      .send(req.t('error.errorOccurred', { error: error.message }));
  }
});

export const updateGet = asyncHandler(async (req: Request, res: Response) => {
  try {
    const authors = await getAuthors();
    const song = (req as any).song;
    const songStatus = Object.values(SongStatus);
    const genres = await getGenres();
    res.render('songs/update', {
      title: req.t('songs.updateSong.title'),
      song,
      authors,
      songStatus,
      genres,
    });
  } catch (error) {
    req.flash('error_msg', req.t('error.failedToFetchSong'));
    res
      .status(500)
      .send(req.t('error.errorOccurred', { error: error.message }));
  }
});

export const updatePost = async (req: Request, res: Response) => {
  try {
    const song = (req as any).song;
    const { title, artist, lyrics, status, genresIds } = req.body;
    const currentSong = await getSongById(req, parseInt(song.id));

    if (!currentSong) {
      req.flash('error_msg', req.t('error.songNotFound'));
      return res.status(404).send(req.t('error.songNotFound'));
    }

    let imageUrl = currentSong.imageUrl;
    let url = currentSong.url;

    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    if (files?.['image']?.[0]) {
      const image = files['image'][0];
      imageUrl = await uploadFileToFirebase(
        image.buffer,
        image.originalname,
        'musics/images',
        image.mimetype
      );
    }

    if (files?.['song']?.[0]) {
      const songFile = files['song'][0];
      url = await uploadFileToFirebase(
        songFile.buffer,
        songFile.originalname,
        'musics/songs',
        songFile.mimetype
      );
    }

    const updatedData: Partial<Song> = {};
    if (title !== currentSong.title) updatedData.title = title;
    if (lyrics !== currentSong.lyrics) updatedData.lyrics = lyrics;
    if (status !== currentSong.status) updatedData.status = status;
    if (imageUrl !== currentSong.imageUrl) updatedData.imageUrl = imageUrl;
    if (url !== currentSong.url) updatedData.url = url;
    if (artist !== currentSong.artist) {
      updatedData.artist = artist;
      const author = await getAuthorById(artist, req.t);
      if (!author) {
        throw new Error(req.t('error.authorNotFound'));
      }
      updatedData.author = author;
    }
    const updatedSong = await updateSong(req, song.id, updatedData);
    if (genresIds) {
      const genres = await getGenresByIds(genresIds);
      await updateSongGenres(req, song.id, genres);
    }

    res.redirect(`/admin/musics/${updatedSong.id}`);
  } catch (error) {
    req.flash('error_msg', req.t('error.failedToUpdateSong'));
    res
      .status(500)
      .send(req.t('error.errorOccurred', { error: error.message }));
  }
};

export const deleteGet = asyncHandler((req: Request, res: Response) => {
  try {
    const song = (req as any).song;
    res.render('songs/delete', {
      title: req.t('songs.deleteSong.title'),
      song,
    });
  } catch (error) {
    req.flash('error_msg', req.t('error.failedToFetchSong'));
    res
      .status(500)
      .send(req.t('error.errorOccurred', { error: error.message }));
  }
});

export const deletePost = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { deleteReason } = req.body;
    const song = (req as any).song;
    await deleteSong(req, song.id, deleteReason);
    res.redirect('/admin/musics');
  } catch (error) {
    req.flash('error_msg', req.t('error.failedToDeleteSong'));
    res
      .status(500)
      .send(req.t('error.errorOccurred', { error: error.message }));
  }
});
