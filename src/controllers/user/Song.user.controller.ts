import {
  PlaylistAvatar,
  PlaylistTitle,
  PlaylistTypes,
} from '@src/enums/PlaylistTypes.enum';
import {
  addSongToPlaylist,
  createPlaylist,
  getPlaylistByUserIdAndTitle,
  removeSongFromPlaylist,
} from '@src/services/Playlist.service';
import { getSongsByPlaylistId } from '@src/services/Song.service';
import { Request, Response } from 'express';
import { t } from 'i18next';

export const deleteSongFromLikedSong = async (req: Request, res: Response) => {
  const user = res.locals.user;
  const { songId } = req.body;
  try {
    const likedSongPlaylist = await getPlaylistByUserIdAndTitle(
      user.id,
      t(`likedSong.${PlaylistTitle.LikedSong}`)
    );
    if (!likedSongPlaylist) {
      return res.status(404).json({ message: t('error.playlistNotFound') });
    }
    await removeSongFromPlaylist(req, likedSongPlaylist?.id, songId);
    res.status(200).json({ message: t('success.removeSongLikedSong') });
  } catch (error) {
    res.status(500).json({ message: t('error.errorFetchingLikedSong') });
  }
};

export const addSongToLikedSong = async (req: Request, res: Response) => {
  const user = res.locals.user;
  const { songId } = req.body;
  try {
    let likedSongPlaylist = await getPlaylistByUserIdAndTitle(
      user.id,
      t(`likedSong.${PlaylistTitle.LikedSong}`)
    );
    if (!likedSongPlaylist) {
      // Nếu không có, sử dụng hàm createPlaylist để tạo playlist mới
      const dataPlaylist = {
        title: t(`likedSong.${PlaylistTitle.LikedSong}`),
        type: PlaylistTypes.User,
        avatar: PlaylistAvatar.avatar,
        users: [user],
      };
      likedSongPlaylist = await createPlaylist(
        req,
        dataPlaylist,
        user.role,
        user.username
      );
    }
    await addSongToPlaylist(req, likedSongPlaylist.id, songId);
    res.status(200).json({ message: t('success.addSongLikedSong') });
  } catch (error) {
    res.status(500).json({ message: t('error.errorFetchingLikedSong') });
  }
};

export const getLikedSong = async (req: Request, res: Response) => {
  const user = res.locals.user;
  try {
    const likedSongPlaylist = await getPlaylistByUserIdAndTitle(
      user.id,
      t(`likedSong.${PlaylistTitle.LikedSong}`)
    );
    if (!likedSongPlaylist) {
      const songsByLikedSong = {};
      return res.render('user.role/likedSong', {
        user,
        songsByLikedSong,
      });
    }
    const songsByLikedSong = await getSongsByPlaylistId(likedSongPlaylist.id);
    return res.render('user.role/likedSong', {
      user,
      songsByLikedSong,
    });
  } catch (error) {
    res.redirect('/login');
  }
};
