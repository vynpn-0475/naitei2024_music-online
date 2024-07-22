/* eslint-disable prettier/prettier */
/* eslint-disable indent */
/* eslint-disable @typescript-eslint/explicit-member-accessibility */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
  CreateDateColumn,
  BaseEntity,
} from 'typeorm';
import { Song } from './Song.entity';
import { User } from './User.entity';
import { PlaylistTypes } from '../enums/PlaylistTypes.enum';

@Entity()
export class Playlist extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  avatar: string;

  @Column({
    type: 'enum',
    enum: PlaylistTypes,
    default: PlaylistTypes.User,
  })
  type: PlaylistTypes;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToMany(() => Song, (song) => song.playlists)
  @JoinTable()
  songs: Song[];

  @ManyToMany(() => User, (user) => user.playlists)
  users: User[];

  constructor(data?: Partial<Playlist>) {
    super();
    if (data) {
      Object.assign(this, data);
    }
  }
}
