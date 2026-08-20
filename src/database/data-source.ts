import 'dotenv/config';
import { join } from 'path';
import { DataSource, DataSourceOptions } from 'typeorm';

const nodeEnv = process.env.NODE_ENV ?? 'development';
const isTest = nodeEnv === 'test';

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 5432),
  username: process.env.DB_USER ?? 'postgres',
  password: process.env.DB_PASS ?? 'postgres',
  database: process.env.DB_NAME ?? 'brain_agriculture',
  entities: [join(__dirname, '..', 'modules', '**', '*.entity.{ts,js}')],
  migrations: [join(__dirname, 'migrations', '*.{ts,js}')],
  // O schema é versionado por migrations. `synchronize` fica restrito ao
  // desenvolvimento local; os testes de integração recriam o schema a partir
  // das próprias migrations, garantindo que elas continuem fiéis às entidades.
  synchronize: nodeEnv === 'development',
  dropSchema: isTest,
  migrationsRun: isTest,
  ssl:
    process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
  logging: process.env.DB_LOGGING === 'true',
};

export default new DataSource(dataSourceOptions);
