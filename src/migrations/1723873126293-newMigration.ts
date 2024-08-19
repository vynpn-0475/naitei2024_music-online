import { MigrationInterface, QueryRunner } from 'typeorm';

export class NewMigration1723873126293 implements MigrationInterface {
  name = 'NewMigration1723873126293';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`user\` ADD \`status\` enum ('Active', 'Deactive') NOT NULL DEFAULT 'Active'`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`status\``);
  }
}
