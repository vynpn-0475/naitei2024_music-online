import { MigrationInterface, QueryRunner } from 'typeorm';

export class NewMigration1723881881400 implements MigrationInterface {
  name = 'NewMigration1723881881400';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`song\` ADD \`deleteReason\` text NULL`
    );
    await queryRunner.query(
      `ALTER TABLE \`song\` CHANGE \`status\` \`status\` enum ('Suggesting', 'Publish', 'Reject', 'Deleted') NOT NULL DEFAULT 'Publish'`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`song\` CHANGE \`status\` \`status\` enum ('Suggesting', 'Publish', 'Reject') NOT NULL DEFAULT 'Publish'`
    );
    await queryRunner.query(
      `ALTER TABLE \`song\` DROP COLUMN \`deleteReason\``
    );
  }
}
