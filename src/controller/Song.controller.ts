import { Request, Response, NextFunction } from 'express';
import asyncHandler from 'express-async-handler';
import { createSong, getAllSongs, getSongById, updateSong } from '@src/services/Song.service';
import { getAuthors } from '@src/services/Author.service';
import { uploadFileToFirebase } from '@src/utils/fileUpload.utils';
import { Song } from '@src/entities/Song.entity';

export const validateAndFetchSong = async (req: Request, res: Response, next: NextFunction) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
        req.flash('error_msg', req.t('notlist.invalidSongId'));
        return res.redirect('/error');
    }
    try {
        const song = await getSongById(id);
        if (song === null) {
            req.flash('error_msg', req.t('notlist.songNotFound'));
            return res.redirect('/error');
        }
        (req as any).song = song;
        next();
    } catch (error) {
        req.flash('error_msg', 'Failed to fetch song');
        res.redirect('/error');
    }
};

export const list = asyncHandler(async (req: Request, res: Response) => {
    try {
        const songs = await getAllSongs();
        res.render('songs/index', { songs, title: 'List Songs' });
    } catch (error) {
        req.flash('error_msg', 'Failed to fetch songs');
        res.redirect('/error');
    }
});

export const detail = asyncHandler(async (req: Request, res: Response) => {
    try {
        const song = (req as any).song;
        res.render('songs/detail', { song, title: 'Song Detail' });
    } catch (error) {
        req.flash('error_msg', 'Failed to fetch song');
        res.redirect('/error');
    }
});

export const createGet = asyncHandler(async (req: Request, res: Response) => {
    try {
      const authors = await getAuthors(); 
      res.render('songs/create', { authors, title: 'Create New Song' });
    } catch (error) {
      req.flash('error_msg', 'Failed to fetch authors');
      res.redirect('/error');
    }
  });

export const createPost = async (req: Request, res: Response) => {
    try {
        const { title, artist, lyrics, status } = req.body;
        let imageUrl = '';
        let url = '';

        const files = req.files as { [fieldname: string]: Express.Multer.File[] };

        if (files && files['image'] && files['image'][0]) {
            const image = files['image'][0];
            imageUrl = await uploadFileToFirebase(image.buffer, image.originalname, 'musics/images', image.mimetype);
        }

        if (files && files['song'] && files['song'][0]) {
            const song = files['song'][0];
            url = await uploadFileToFirebase(song.buffer, song.originalname, 'musics/songs', song.mimetype);
        }

        const song = await createSong({ title, artist, lyrics, imageUrl, url, status });
        res.redirect(`/admin/musics`);
    } catch (error) {
        req.flash('error_msg', 'Failed to create song');
        res.status(500).send(`Error creating song: ${error.message}`);
    }
};

export const updateGet = asyncHandler(async (req: Request, res: Response) => {
    try {
        const authors = await getAuthors(); 
        const song = (req as any).song;
        res.render('songs/update', {
            title: 'Update Song',
            song,
            authors,
        });
    } catch (error) {
        req.flash('error_msg', 'Failed to fetch song');
        res.status(500).send('Error fetching song');
    }
});

export const updatePost = async (req: Request, res: Response) => {
    const songId = parseInt(req.params.id, 10);
    const { title, artist, lyrics, status } = req.body;
    const currentSong = await getSongById(songId);
    if (!currentSong) {
        req.flash('error_msg', 'Song not found');
        return res.status(404).send('Song not found');
    }

    let imageUrl = currentSong.imageUrl;
    let url = currentSong.url;

    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    try {
        if (files && files['image'] && files['image'][0]) {
            const image = files['image'][0];
            imageUrl = await uploadFileToFirebase(image.buffer, image.originalname, 'musics/images', image.mimetype);
        }

        if (files && files['song'] && files['song'][0]) {
            const songFile = files['song'][0];
            url = await uploadFileToFirebase(songFile.buffer, songFile.originalname, 'musics/songs', songFile.mimetype);
        }

        const updatedData: Partial<Song> = {};
        if (title !== currentSong.title) updatedData.title = title;
        if (artist !== currentSong.artist) updatedData.artist = artist;
        if (lyrics !== currentSong.lyrics) updatedData.lyrics = lyrics;
        if (status !== currentSong.status) updatedData.status = status;
        if (imageUrl !== currentSong.imageUrl) updatedData.imageUrl = imageUrl;
        if (url !== currentSong.url) updatedData.url = url;

        const updatedSong = await updateSong(songId, updatedData);

        res.redirect(`/admin/musics/${updatedSong.id}`);
    } catch (error) {
        req.flash('error_msg', 'Failed to update song');
        res.status(500).send(`Error updating song: ${error.message}`);
    }
};
