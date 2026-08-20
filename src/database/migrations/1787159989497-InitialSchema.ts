import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1787159989497 implements MigrationInterface {
  name = 'InitialSchema1787159989497';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    await queryRunner.query(
      `CREATE TABLE "producers" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "document" character varying(14) NOT NULL, "name" character varying(140) NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_55554aac38152436aa25b1e3530" UNIQUE ("document"), CONSTRAINT "PK_7f16886d1a44ed0974232b82506" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "farms" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(140) NOT NULL, "city" character varying(120) NOT NULL, "state" character varying(2) NOT NULL, "totalArea" numeric(14,2) NOT NULL, "agricultural_area" numeric(14,2) NOT NULL, "vegetation_area" numeric(14,2) NOT NULL, "producer_id" uuid NOT NULL, CONSTRAINT "PK_39aff9c35006b14025bba5a43d9" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "harvests" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "label" character varying(80) NOT NULL, "year" integer NOT NULL, "farm_id" uuid NOT NULL, CONSTRAINT "PK_fb748ae28bc0000875b1949a0a6" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "crops" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(40) NOT NULL, CONSTRAINT "UQ_33e6399d4c7cedd12806d5d4dd7" UNIQUE ("name"), CONSTRAINT "PK_098dbeb7c803dc7c08a7f02b805" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "harvest_crops" ("harvestsId" uuid NOT NULL, "cropsId" uuid NOT NULL, CONSTRAINT "PK_a7c48cb7a41c4f9dc6448e1cae6" PRIMARY KEY ("harvestsId", "cropsId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_9236472472dc9f17afd2322aef" ON "harvest_crops"  ("harvestsId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_feaa663854f2dfa617c38752c6" ON "harvest_crops"  ("cropsId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "farms" ADD CONSTRAINT "FK_9c593007fa71180e11f2af67458" FOREIGN KEY ("producer_id") REFERENCES "producers"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "harvests" ADD CONSTRAINT "FK_231c2de20d25d78746cc6b36fca" FOREIGN KEY ("farm_id") REFERENCES "farms"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "harvest_crops" ADD CONSTRAINT "FK_9236472472dc9f17afd2322aefb" FOREIGN KEY ("harvestsId") REFERENCES "harvests"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "harvest_crops" ADD CONSTRAINT "FK_feaa663854f2dfa617c38752c61" FOREIGN KEY ("cropsId") REFERENCES "crops"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "harvest_crops" DROP CONSTRAINT "FK_feaa663854f2dfa617c38752c61"`,
    );
    await queryRunner.query(
      `ALTER TABLE "harvest_crops" DROP CONSTRAINT "FK_9236472472dc9f17afd2322aefb"`,
    );
    await queryRunner.query(
      `ALTER TABLE "harvests" DROP CONSTRAINT "FK_231c2de20d25d78746cc6b36fca"`,
    );
    await queryRunner.query(
      `ALTER TABLE "farms" DROP CONSTRAINT "FK_9c593007fa71180e11f2af67458"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_feaa663854f2dfa617c38752c6"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_9236472472dc9f17afd2322aef"`,
    );
    await queryRunner.query(`DROP TABLE "harvest_crops"`);
    await queryRunner.query(`DROP TABLE "crops"`);
    await queryRunner.query(`DROP TABLE "harvests"`);
    await queryRunner.query(`DROP TABLE "farms"`);
    await queryRunner.query(`DROP TABLE "producers"`);
  }
}
