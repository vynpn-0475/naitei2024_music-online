/* eslint-disable prettier/prettier */
/* eslint-disable quotes */
/* eslint-disable max-len */
/* eslint-disable indent */
/* eslint-disable @typescript-eslint/explicit-member-accessibility */

import { MigrationInterface, QueryRunner } from 'typeorm';

export class NewMigration1721868974111 implements MigrationInterface {
  name = 'NewMigration1721868974111';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE \`author\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`fullname\` varchar(255) NOT NULL,
        \`avatar\` varchar(255) NOT NULL,
        \`dateOfBirth\` datetime NOT NULL,
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB
    `);

    await queryRunner.query(`
      CREATE TABLE \`album\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`title\` varchar(255) NOT NULL,
        \`imageUrl\` varchar(255) NOT NULL,
        \`releaseDate\` datetime NOT NULL,
        \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        \`authorId\` int NULL,
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB
    `);

    await queryRunner.query(`
      CREATE TABLE \`comment\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`content\` text NOT NULL,
        \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`songId\` int NULL,
        \`userId\` int NULL,
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB
    `);

    await queryRunner.query(`
      CREATE TABLE \`genre\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`name\` varchar(255) NOT NULL,
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB
    `);

    await queryRunner.query(`
      CREATE TABLE \`song\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`title\` varchar(255) NOT NULL,
        \`artist\` varchar(255) NOT NULL,
        \`lyrics\` text NOT NULL,
        \`imageUrl\` varchar(255) NOT NULL,
        \`url\` varchar(255) NOT NULL,
        \`status\` enum ('Suggesting', 'Publish', 'Reject') NOT NULL DEFAULT 'Publish',
        \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        \`albumId\` int NULL,
        \`authorId\` int NULL,
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB
    `);

    await queryRunner.query(`
      CREATE TABLE \`playlist\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`title\` varchar(255) NOT NULL,
        \`avatar\` varchar(255) NOT NULL,
        \`type\` enum ('System', 'User') NOT NULL DEFAULT 'User',
        \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB
    `);

    await queryRunner.query(`
      CREATE TABLE \`user\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`username\` varchar(255) NOT NULL,
        \`email\` varchar(255) NOT NULL,
        \`password\` varchar(255) NOT NULL,
        \`dateOfBirth\` datetime NOT NULL,
        \`role\` enum ('Admin', 'User', 'Guess') NOT NULL DEFAULT 'Guess',
        \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB
    `);

    await queryRunner.query(`
      CREATE TABLE \`suggested_song\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`rejection_reason\` text NULL,
        \`status\` enum ('Pending', 'Approved', 'Rejected') NOT NULL DEFAULT 'Pending',
        \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        \`userId\` int NULL,
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB
    `);

    await queryRunner.query(`
      CREATE TABLE \`song_genres_genre\` (
        \`songId\` int NOT NULL,
        \`genreId\` int NOT NULL,
        INDEX \`IDX_ef75919535dd2416feab8a270f\` (\`songId\`),
        INDEX \`IDX_01b24c0f3bc40b1246f1d853f8\` (\`genreId\`),
        PRIMARY KEY (\`songId\`, \`genreId\`)
      ) ENGINE=InnoDB
    `);

    await queryRunner.query(`
      CREATE TABLE \`playlist_songs_song\` (
        \`playlistId\` int NOT NULL,
        \`songId\` int NOT NULL,
        INDEX \`IDX_3e66846398a681262e56574fc9\` (\`playlistId\`),
        INDEX \`IDX_efc8204ff6cdd9f17e83f8d001\` (\`songId\`),
        PRIMARY KEY (\`playlistId\`, \`songId\`)
      ) ENGINE=InnoDB
    `);

    await queryRunner.query(`
      CREATE TABLE \`user_playlists_playlist\` (
        \`userId\` int NOT NULL,
        \`playlistId\` int NOT NULL,
        INDEX \`IDX_a15d6a6bcd37b4ea765fe98064\` (\`userId\`),
        INDEX \`IDX_d374b3f7f7148b196a31d57253\` (\`playlistId\`),
        PRIMARY KEY (\`userId\`, \`playlistId\`)
      ) ENGINE=InnoDB
    `);

    await queryRunner.query(`
      CREATE TABLE \`user_favorite_songs_song\` (
        \`userId\` int NOT NULL,
        \`songId\` int NOT NULL,
        INDEX \`IDX_c717cf594798f1e77d891e549b\` (\`userId\`),
        INDEX \`IDX_e782a10b07ed354029b0738ea5\` (\`songId\`),
        PRIMARY KEY (\`userId\`, \`songId\`)
      ) ENGINE=InnoDB
    `);

    await queryRunner.query(`
      ALTER TABLE \`album\` 
      ADD CONSTRAINT \`FK_8260e1386a0fa66b057d520b97f\` 
      FOREIGN KEY (\`authorId\`) 
      REFERENCES \`author\`(\`id\`) 
      ON DELETE NO ACTION 
      ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE \`comment\` 
      ADD CONSTRAINT \`FK_4215338f68b4313c6d796ce825c\` 
      FOREIGN KEY (\`songId\`) 
      REFERENCES \`song\`(\`id\`) 
      ON DELETE NO ACTION 
      ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE \`comment\` 
      ADD CONSTRAINT \`FK_c0354a9a009d3bb45a08655ce3b\` 
      FOREIGN KEY (\`userId\`) 
      REFERENCES \`user\`(\`id\`) 
      ON DELETE NO ACTION 
      ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE \`song\` 
      ADD CONSTRAINT \`FK_c529927ae410af49faaf2e239a5\` 
      FOREIGN KEY (\`albumId\`) 
      REFERENCES \`album\`(\`id\`) 
      ON DELETE NO ACTION 
      ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE \`song\` 
      ADD CONSTRAINT \`FK_2347b7912d4e51efb37d74f52e3\` 
      FOREIGN KEY (\`authorId\`) 
      REFERENCES \`author\`(\`id\`) 
      ON DELETE NO ACTION 
      ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE \`song_genres_genre\` 
      ADD CONSTRAINT \`FK_ef75919535dd2416feab8a270f5\` 
      FOREIGN KEY (\`songId\`) 
      REFERENCES \`song\`(\`id\`) 
      ON DELETE CASCADE 
      ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE \`song_genres_genre\` 
      ADD CONSTRAINT \`FK_01b24c0f3bc40b1246f1d853f82\` 
      FOREIGN KEY (\`genreId\`) 
      REFERENCES \`genre\`(\`id\`) 
      ON DELETE CASCADE 
      ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE \`playlist_songs_song\` 
      ADD CONSTRAINT \`FK_3e66846398a681262e56574fc9f\` 
      FOREIGN KEY (\`playlistId\`) 
      REFERENCES \`playlist\`(\`id\`) 
      ON DELETE CASCADE 
      ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE \`playlist_songs_song\` 
      ADD CONSTRAINT \`FK_efc8204ff6cdd9f17e83f8d001b\` 
      FOREIGN KEY (\`songId\`) 
      REFERENCES \`song\`(\`id\`) 
      ON DELETE CASCADE 
      ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE \`user_playlists_playlist\` 
      ADD CONSTRAINT \`FK_a15d6a6bcd37b4ea765fe980641\` 
      FOREIGN KEY (\`userId\`) 
      REFERENCES \`user\`(\`id\`) 
      ON DELETE CASCADE 
      ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE \`user_playlists_playlist\` 
      ADD CONSTRAINT \`FK_d374b3f7f7148b196a31d572539\` 
      FOREIGN KEY (\`playlistId\`) 
      REFERENCES \`playlist\`(\`id\`) 
      ON DELETE CASCADE 
      ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE \`user_favorite_songs_song\` 
      ADD CONSTRAINT \`FK_c717cf594798f1e77d891e549b0\` 
      FOREIGN KEY (\`userId\`) 
      REFERENCES \`user\`(\`id\`) 
      ON DELETE CASCADE 
      ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE \`user_favorite_songs_song\` 
      ADD CONSTRAINT \`FK_e782a10b07ed354029b0738ea56\` 
      FOREIGN KEY (\`songId\`) 
      REFERENCES \`song\`(\`id\`) 
      ON DELETE CASCADE 
      ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE \`user_favorite_songs_song\``);
    await queryRunner.query(`DROP TABLE \`user_playlists_playlist\``);
    await queryRunner.query(`DROP TABLE \`playlist_songs_song\``);
    await queryRunner.query(`DROP TABLE \`song_genres_genre\``);
    await queryRunner.query(`DROP TABLE \`suggested_song\``);
    await queryRunner.query(`DROP TABLE \`user\``);
    await queryRunner.query(`DROP TABLE \`playlist\``);
    await queryRunner.query(`DROP TABLE \`song\``);
    await queryRunner.query(`DROP TABLE \`genre\``);
    await queryRunner.query(`DROP TABLE \`comment\``);
    await queryRunner.query(`DROP TABLE \`album\``);
    await queryRunner.query(`DROP TABLE \`author\``);
  }
}
