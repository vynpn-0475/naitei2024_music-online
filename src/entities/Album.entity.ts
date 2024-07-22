/* eslint-disable prettier/prettier */
/* eslint-disable indent */
/* eslint-disable @typescript-eslint/explicit-member-accessibility */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  BaseEntity,
} from 'typeorm';
import { Song } from './Song.entity';
import { Author } from './Author.entity';

@Entity()
export class Album extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  imageUrl: string;

  @Column()
  releaseDate: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Song, (song) => song.album)
  songs: Song[];

  @ManyToOne(() => Author, (author) => author.albums)
  author: Author;

  constructor(data?: Partial<Album>) {
    super();
    if (data) {
      Object.assign(this, data);
    }
  }
}
