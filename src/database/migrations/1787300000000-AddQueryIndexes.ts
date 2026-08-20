import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Índices de apoio às consultas mais quentes:
 * - farms.state         -> agregação "fazendas por estado" do dashboard
 * - farms.producer_id   -> carregamento das fazendas de um produtor e cascata do DELETE
 * - harvests.farm_id    -> join farm -> harvest -> crop do dashboard
 *
 * O Postgres não cria índice automaticamente para colunas de chave estrangeira.
 */
export class AddQueryIndexes1787300000000 implements MigrationInterface {
  name = 'AddQueryIndexes1787300000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE INDEX "IDX_farms_state" ON "farms" ("state")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_farms_producer_id" ON "farms" ("producer_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_harvests_farm_id" ON "harvests" ("farm_id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_harvests_farm_id"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_farms_producer_id"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_farms_state"`);
  }
}
