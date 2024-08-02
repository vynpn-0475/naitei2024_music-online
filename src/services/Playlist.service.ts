import { AppDataSource } from '../config/data-source';
import { Playlist } from '../entities/Playlist.entity';
import { getSongById } from './Song.service';

const playlistRepository = AppDataSource.getRepository(Playlist);

export const getAllPlaylists = async () => {
  try {
    return await playlistRepository.find();
  } catch (error) {
    throw new Error('Error fetching Playlists');
  }
};

export const getPlaylistById = async (playlistId: number) => {
  try {
    return await playlistRepository.findOne({where: { id: playlistId }, relations: ['songs', 'users']});
  } catch (error) {
    throw new Error('Error fetching Playlist');
  }
};

export const createPlaylist = async (data: Partial<Playlist>) => {
  try {
    const playlist = new Playlist(data);
    await playlist.save();
    return playlist;
  } catch (error) {
    throw new Error('Error creating Playlist');
  }
}

export const addSongToPlaylist = async (playlistId: number, songId: number) => {
  const playlist = await playlistRepository.findOne({
    where: { id: playlistId }, 
    relations: ['songs']
  });
  if (!playlist) {
    throw new Error('Playlist not found');
  }
  
  const song = await getSongById(songId);
  if (!song) {
    throw new Error('Song not found');
  }
  
  if (!playlist.songs) {
    playlist.songs = [];
  }
  
  playlist.songs.push(song);
  await playlist.save();
};
  
export const removeSongFromPlaylist = async (playlistId: number, songId: number) => {
  const playlist = await playlistRepository.findOne({
    where: { id: playlistId },
    relations: ['songs']
  });

  if (!playlist) {
    throw new Error('Playlist not found');
  }
  
  if (!playlist.songs) {
    playlist.songs = [];
  }
  const songExists = playlist.songs.some(s => s.id === songId);
  if (!songExists) {
    throw new Error('Song not found in playlist');
  }
  
  playlist.songs = playlist.songs.filter(s => s.id !== songId);
  await playlist.save();
};


export const updatePlaylist = async (playlistId: number, data: Partial<Playlist>) => {
  try {
    const playlist = await playlistRepository.findOne({ where: { id: playlistId } });
    if (!playlist) {
      throw new Error('Playlist not found');
    }
    Object.assign(playlist, data);
    await playlist.save();
    return playlist;
  } catch (error) {
    throw new Error('Error updating Playlist');
  }
};

export const deletePlaylist = async (playlistId: number) => {
  try {
      const playlist = await playlistRepository.findOne({ where: { id: playlistId } });
      if (!playlist) {
        throw new Error('Playlist not found');
      }
      await playlist.remove();
    } catch (error) {
      throw new Error('Error deleting Playlist');
    }
};
