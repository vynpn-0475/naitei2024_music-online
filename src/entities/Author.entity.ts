/* eslint-disable prettier/prettier */
/* eslint-disable indent */
/* eslint-disable @typescript-eslint/explicit-member-accessibility */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  BaseEntity,
} from 'typeorm';
import { Song } from './Song.entity';
import { Album } from './Album.entity';

@Entity()
export class Author extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  fullname: string;

  @Column()
  avatar: string;

  @Column()
  dateOfBirth: Date;

  @OneToMany(() => Song, (song) => song.author)
  songs: Song[];

  @OneToMany(() => Album, (album) => album.author)
  albums: Album[];

  constructor(data?: Partial<Author>) {
    super();
    if (data) {
      Object.assign(this, data);
    }
  }
}
