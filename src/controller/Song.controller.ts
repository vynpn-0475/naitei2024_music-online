import { Request, Response, NextFunction } from 'express';
import asyncHandler from 'express-async-handler';
import { createSong, getAllSongs } from '@src/services/Song.service';
import { getAuthors } from '@src/services/Author.service';
import { uploadFileToFirebase } from '@src/utils/fileUpload.utils';

export const list = asyncHandler(async (req: Request, res: Response) => {
    try {
        const songs = await getAllSongs();
        res.render('songs/index', { songs, title: 'List Songs' });
    } catch (error) {
        req.flash('error_msg', 'Failed to fetch songs');
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
