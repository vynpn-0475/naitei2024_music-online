/* eslint-disable prettier/prettier */
/* eslint-disable indent */
/* eslint-disable @typescript-eslint/explicit-member-accessibility */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
  OneToMany,
  OneToOne,
  BaseEntity,
} from 'typeorm';
import { Album } from './Album.entity';
import { Comment } from './Comment.entity';
import { Genre } from './Genre.entity';
import { User } from './User.entity';
import { Playlist } from './Playlist.entity';
import { Author } from './Author.entity';
import { SuggestedSong } from './SuggestedSong.entity';
import { SongStatus } from '../enums/SongStatus.enum';

@Entity()
export class Song extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  artist: string;

  @Column('text')
  lyrics: string;

  @Column()
  imageUrl: string;

  @Column()
  url: string;

  @Column({
    type: 'enum',
    enum: SongStatus,
    default: SongStatus.Publish,
  })
  status: SongStatus;

  @ManyToMany(() => Genre, (genre) => genre.songs)
  @JoinTable()
  genres: Genre[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Comment, (comment) => comment.song)
  comment: Comment[];

  @ManyToMany(() => User, (user) => user.favoriteSongs)
  favoritedBy: User[];

  @ManyToMany(() => Playlist, (playlist) => playlist.songs)
  playlists: Playlist[];

  @ManyToOne(() => Album, (album) => album.songs)
  album: Album;

  @ManyToOne(() => Author, (author) => author.songs)
  author: Author;

  @OneToOne(() => SuggestedSong, (suggestedSong) => suggestedSong.song)
  suggestedSong?: SuggestedSong;

  constructor(data?: Partial<Song>) {
    super();
    if (data) {
      Object.assign(this, data);
    }
  }
}
