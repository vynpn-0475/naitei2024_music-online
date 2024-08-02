import { Playlist } from './../entities/Playlist.entity';
import { Request, Response, NextFunction } from 'express';
import asyncHandler from 'express-async-handler';
import { addSongToPlaylist, createPlaylist, deletePlaylist, getAllPlaylists, getPlaylistById, removeSongFromPlaylist, updatePlaylist } from '@src/services/Playlist.service';
import { getAllSongs, getSongsByIds } from '@src/services/Song.service';
import { PlaylistTypes } from '@src/enums/PlaylistTypes.enum';
import { uploadFileToFirebase } from '@src/utils/fileUpload.utils';

export const validateAndFetchPlaylist = async (req: Request, res: Response, next: NextFunction) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
        req.flash('error_msg', req.t('notlist.invalidPlaylistId'));
        return res.redirect('/error');
    }
    try {
        const playlist = await getPlaylistById(id);
        if (playlist === null) {
            req.flash('error_msg', req.t('notlist.PlaylistNotFound'));
            return res.redirect('/error');
        }
        (req as any).playlist = playlist;
        next();
    } catch (error) {
        req.flash('error_msg', 'Failed to fetch Playlist');
        res.redirect('/error');
    }
};

export const list = asyncHandler(async (req: Request, res: Response) => {
    try {
        const playlists = await getAllPlaylists();
        res.render('playlists/index', { playlists, title: 'List Playlists' });
    } catch (error) {
        req.flash('error_msg', 'Failed to fetch Playlists');
        res.redirect('/error');
    }
});

export const detail = asyncHandler(async (req: Request, res: Response) => {
    try {
        const playlist = (req as any).playlist;
        const songs = await getAllSongs();
        const playlistSongIds = playlist.songs.map((song: any) => song.id);
        const availableSongs = songs.filter((song: any) => !playlistSongIds.includes(song.id));
        const firstSong = playlist.songs.length > 0 ? playlist.songs[0] : null;
        res.render('playlists/detail', { 
          playlist, 
          title: 'Playlist Detail', 
          songs: playlist.songs, 
          availableSongs, 
          length: playlist.songs.length,
          firstSong
        });
    } catch (error) {
        req.flash('error_msg', 'Failed to fetch Playlist');
        res.redirect('/error');
    }
});

export const addSongPost = asyncHandler(async (req: Request, res: Response) => {
    try {
        const playlistId = parseInt(req.params.id, 10);
        const { songId } = req.body;

        await addSongToPlaylist(playlistId, songId);
        res.redirect(`/admin/playlists/${playlistId}`);
    } catch (error) {
        req.flash('error_msg', 'Failed to add song to Playlist');
        res.status(500).json({ success: false, message: error.message });
    }
});

export const removeSongPost = asyncHandler(async (req: Request, res: Response) => {
    try {
      const playlistId = parseInt(req.params.id, 10);
      const { songId } = req.body;
      await removeSongFromPlaylist(playlistId, Number(songId));
      res.redirect(`/admin/playlists/${playlistId}`);
    } catch (error) {
      req.flash('error_msg', 'Failed to remove song from Playlist');
      res.status(500).json({ success: false, message: error.message });
    }
});

export const createGet = asyncHandler(async (req: Request, res: Response) => {
    try {
      const songs = await getAllSongs();
      const playlistTypes = Object.values(PlaylistTypes);

      res.render('playlists/create', { songs, playlistTypes, title: 'Create New Playlist' });
    } catch (error) {
      req.flash('error_msg', 'Failed to fetch authors');
      res.redirect('/error');
    }
  });

export const createPost = async (req: Request, res: Response) => {
    try {
        const { title, songIds, type  } = req.body;
        const songs = await getSongsByIds(songIds);

        let avatarUrl = '';

        if (req.file) {
            avatarUrl = await uploadFileToFirebase(req.file.buffer, req.file.originalname, 'playlist', req.file.mimetype);
          } 

        const playlist = await createPlaylist({title, avatar: avatarUrl, songs, type });

        res.redirect(`/admin/playlists/${playlist.id}`);
    } catch (error) {
        req.flash('error_msg', 'Failed to create Playlist');
        res.status(500).send(`Error creating Playlist: ${error.message}`);
    }
};

export const updateGet = asyncHandler(async (req: Request, res: Response) => {
    try {
        const playlist = (req as any).playlist;
        const playlistTypes = Object.values(PlaylistTypes);
        const songs = await getAllSongs();

        res.render('playlists/update', {
            title: 'Update Playlist',
            playlist,
            songs,
            playlistTypes,
        });
    } catch (error) {
        req.flash('error_msg', 'Failed to fetch Playlist');
        res.status(500).send('Error fetching Playlist');
    }
});

export const updatePost = async (req: Request, res: Response) => {
    try{
        const playlistId = parseInt(req.params.id, 10);
        const { title, songIds, type } = req.body;

        let avatarUrl = '';

        if (req.file) {
            avatarUrl = await uploadFileToFirebase(req.file.buffer, req.file.originalname, 'playlists', req.file.mimetype);
        } 

        const updatedData: Partial<Playlist> = {
            title,
            avatar: avatarUrl,
            songs: await getSongsByIds(songIds),
            type
        };
        const updatedPlaylist = await updatePlaylist(playlistId, updatedData);

        res.redirect(`/admin/playlists/${updatedPlaylist.id}`);
    } catch (error) {
        req.flash('error_msg', 'Failed to update Playlist');
        res.status(500).send(`Error updating Playlist: ${error.message}`);
    }
};

export const deleteGet = asyncHandler(async (req: Request, res: Response) => {
    try {
        const playlist = (req as any).playlist;
        const songs = await getAllSongs();
        res.render('playlists/delete', {
            title: 'Delete Playlist',
            playlist,
            songs,
        });
    } catch (error) {
        req.flash('error_msg', 'Failed to fetch Playlist');
        res.status(500).send('Error fetching Playlist');
    }
});

export const deletePost = asyncHandler(async (req: Request, res: Response) => {
    try {
        const playlistId = parseInt(req.params.id, 10);
        await deletePlaylist(playlistId);
        res.redirect('/admin/playlists');
    } catch (error) {
        req.flash('error_msg', 'Failed to delete Playlist');
        res.status(500).send(`Error deleting Playlist: ${error.message}`);
    }
});
