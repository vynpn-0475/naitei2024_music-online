/* eslint-disable prettier/prettier */
/* eslint-disable indent */
/* eslint-disable @typescript-eslint/explicit-member-accessibility */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  BaseEntity,
} from 'typeorm';
import { Song } from './Song.entity';
import { User } from './User.entity';

@Entity()
export class Comment extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  content: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Song, (song) => song.comment)
  song: Song;

  @ManyToOne(() => User, (user) => user.comments)
  user: User;

  constructor(data?: Partial<Comment>) {
    super();
    if (data) {
      Object.assign(this, data);
    }
  }
}
