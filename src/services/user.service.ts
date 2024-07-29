import { AppDataSource } from '@src/config/data-source';
import { User } from '@src/entities/User.entity';
class UserService {
  private userRepository = AppDataSource.getRepository(User);
  public async findUsers() {
    return await this.userRepository.find();
  }
  public async findById(id: number) {
    return await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.comments', 'comment')
      .leftJoinAndSelect('user.favoriteSongs', 'favoriteSong')
      .leftJoinAndSelect('user.suggestedSongs', 'suggestedSong')
      .leftJoinAndSelect('user.playlists', 'playlist')
      .where('user.id = :id', { id: id })
      .addSelect([
        'COUNT(comment.id) as commentCount',
        'COUNT(favoriteSong.id) as favoriteSongCount',
        'COUNT(suggestedSong.id) as suggestedSongCount',
        'COUNT(playlist.id) as playlistCount',
      ])
      .groupBy('user.id')
      .getRawOne();
  }
}

export default new UserService();
