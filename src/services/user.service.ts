import { AppDataSource } from '@src/config/data-source';
import { User } from '@src/entities/User.entity';
class UserService {
  private userRepository = AppDataSource.getRepository(User);

  public async findByUsername(username: string) {
    return await this.userRepository.findOne({
      where: {
        username: username,
      },
    });
  }
  public async create(userData: Partial<User>): Promise<boolean> {
    const user = new User(userData);
    return this.userRepository
      .save(user)
      .then(() => true)
      .catch(() => {
        return false;
      });
  }
  public async findUsers() {
    return await this.userRepository.find();
  }
}

export default new UserService();
