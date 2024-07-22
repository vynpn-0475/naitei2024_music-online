import { Album } from '../entities/Album.entity';

export const createAlbum = async (data: Partial<Album>) => {
  try {
    const album = new Album(data);
    await album.save();
    return true;
  } catch (error) {
    return false;
  }
};
