import { MigrationInterface, QueryRunner } from 'typeorm';

export class NewMigration1723714983340 implements MigrationInterface {
  name = 'NewMigration1723714983340';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`song_genres_genre\` DROP FOREIGN KEY \`FK_01b24c0f3bc40b1246f1d853f82\``
    );
    await queryRunner.query(
      `ALTER TABLE \`song_genres_genre\` DROP FOREIGN KEY \`FK_ef75919535dd2416feab8a270f5\``
    );
    await queryRunner.query(
      `ALTER TABLE \`playlist_songs_song\` DROP FOREIGN KEY \`FK_3e66846398a681262e56574fc9f\``
    );
    await queryRunner.query(
      `ALTER TABLE \`playlist_songs_song\` DROP FOREIGN KEY \`FK_efc8204ff6cdd9f17e83f8d001b\``
    );
    await queryRunner.query(
      `ALTER TABLE \`user_playlists_playlist\` DROP FOREIGN KEY \`FK_a15d6a6bcd37b4ea765fe980641\``
    );
    await queryRunner.query(
      `ALTER TABLE \`user_playlists_playlist\` DROP FOREIGN KEY \`FK_d374b3f7f7148b196a31d572539\``
    );
    await queryRunner.query(
      `ALTER TABLE \`user_favorite_songs_song\` DROP FOREIGN KEY \`FK_c717cf594798f1e77d891e549b0\``
    );
    await queryRunner.query(
      `ALTER TABLE \`user_favorite_songs_song\` DROP FOREIGN KEY \`FK_e782a10b07ed354029b0738ea56\``
    );
    await queryRunner.query(`ALTER TABLE \`author\` ADD \`bio\` text NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE \`suggested_song\` ADD CONSTRAINT \`FK_43dd9ca7183997ec0f9802e3050\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE \`song_genres_genre\` ADD CONSTRAINT \`FK_ef75919535dd2416feab8a270f7\` FOREIGN KEY (\`songId\`) REFERENCES \`song\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`
    );
    await queryRunner.query(
      `ALTER TABLE \`song_genres_genre\` ADD CONSTRAINT \`FK_01b24c0f3bc40b1246f1d853f8b\` FOREIGN KEY (\`genreId\`) REFERENCES \`genre\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE \`playlist_songs_song\` ADD CONSTRAINT \`FK_3e66846398a681262e56574fc99\` FOREIGN KEY (\`playlistId\`) REFERENCES \`playlist\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`
    );
    await queryRunner.query(
      `ALTER TABLE \`playlist_songs_song\` ADD CONSTRAINT \`FK_efc8204ff6cdd9f17e83f8d001e\` FOREIGN KEY (\`songId\`) REFERENCES \`song\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE \`user_playlists_playlist\` ADD CONSTRAINT \`FK_a15d6a6bcd37b4ea765fe980642\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`
    );
    await queryRunner.query(
      `ALTER TABLE \`user_playlists_playlist\` ADD CONSTRAINT \`FK_d374b3f7f7148b196a31d57253a\` FOREIGN KEY (\`playlistId\`) REFERENCES \`playlist\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE \`user_favorite_songs_song\` ADD CONSTRAINT \`FK_c717cf594798f1e77d891e549b5\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`
    );
    await queryRunner.query(
      `ALTER TABLE \`user_favorite_songs_song\` ADD CONSTRAINT \`FK_e782a10b07ed354029b0738ea5c\` FOREIGN KEY (\`songId\`) REFERENCES \`song\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`user_favorite_songs_song\` DROP FOREIGN KEY \`FK_e782a10b07ed354029b0738ea5c\``
    );
    await queryRunner.query(
      `ALTER TABLE \`user_favorite_songs_song\` DROP FOREIGN KEY \`FK_c717cf594798f1e77d891e549b5\``
    );
    await queryRunner.query(
      `ALTER TABLE \`user_playlists_playlist\` DROP FOREIGN KEY \`FK_d374b3f7f7148b196a31d57253a\``
    );
    await queryRunner.query(
      `ALTER TABLE \`user_playlists_playlist\` DROP FOREIGN KEY \`FK_a15d6a6bcd37b4ea765fe980642\``
    );
    await queryRunner.query(
      `ALTER TABLE \`playlist_songs_song\` DROP FOREIGN KEY \`FK_efc8204ff6cdd9f17e83f8d001e\``
    );
    await queryRunner.query(
      `ALTER TABLE \`playlist_songs_song\` DROP FOREIGN KEY \`FK_3e66846398a681262e56574fc99\``
    );
    await queryRunner.query(
      `ALTER TABLE \`song_genres_genre\` DROP FOREIGN KEY \`FK_01b24c0f3bc40b1246f1d853f8b\``
    );
    await queryRunner.query(
      `ALTER TABLE \`song_genres_genre\` DROP FOREIGN KEY \`FK_ef75919535dd2416feab8a270f7\``
    );
    await queryRunner.query(
      `ALTER TABLE \`suggested_song\` DROP FOREIGN KEY \`FK_43dd9ca7183997ec0f9802e3050\``
    );
    await queryRunner.query(`ALTER TABLE \`author\` DROP COLUMN \`bio\``);
    await queryRunner.query(
      `ALTER TABLE \`user_favorite_songs_song\` ADD CONSTRAINT \`FK_e782a10b07ed354029b0738ea56\` FOREIGN KEY (\`songId\`) REFERENCES \`song\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE \`user_favorite_songs_song\` ADD CONSTRAINT \`FK_c717cf594798f1e77d891e549b0\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE \`user_playlists_playlist\` ADD CONSTRAINT \`FK_d374b3f7f7148b196a31d572539\` FOREIGN KEY (\`playlistId\`) REFERENCES \`playlist\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE \`user_playlists_playlist\` ADD CONSTRAINT \`FK_a15d6a6bcd37b4ea765fe980641\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE \`playlist_songs_song\` ADD CONSTRAINT \`FK_efc8204ff6cdd9f17e83f8d001b\` FOREIGN KEY (\`songId\`) REFERENCES \`song\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE \`playlist_songs_song\` ADD CONSTRAINT \`FK_3e66846398a681262e56574fc9f\` FOREIGN KEY (\`playlistId\`) REFERENCES \`playlist\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE \`song_genres_genre\` ADD CONSTRAINT \`FK_ef75919535dd2416feab8a270f5\` FOREIGN KEY (\`songId\`) REFERENCES \`song\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE \`song_genres_genre\` ADD CONSTRAINT \`FK_01b24c0f3bc40b1246f1d853f82\` FOREIGN KEY (\`genreId\`) REFERENCES \`genre\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`
    );
  }
}
