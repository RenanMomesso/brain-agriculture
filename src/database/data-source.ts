import 'dotenv/config';
import { join } from 'path';
import { DataSource, DataSourceOptions } from 'typeorm';

const nodeEnv = process.env.NODE_ENV ?? 'development';
const isTest = nodeEnv === 'test';

const entities = [join(__dirname, '..', 'modules', '**', '*.entity.{ts,js}')];
const migrations = [join(__dirname, 'migrations', '*.{ts,js}')];

// Provedores gerenciados (Render, Heroku, Neon, Railway...) entregam o banco
// como uma única connection string. Quando ela existe tem prioridade; caso
// contrário caímos nas variáveis avulsas, usadas no docker-compose e local.
const databaseUrl = process.env.DATABASE_URL;

// A connection string do Render/Neon já vem sem `sslmode`, mas o servidor
// exige TLS a partir de fora da rede interna. `rejectUnauthorized: false`
// aceita o certificado autoassinado desses provedores.
const ssl =
  process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined;

const connection: DataSourceOptions = databaseUrl
  ? { type: 'postgres', url: databaseUrl, ssl }
  : {
      type: 'postgres',
      host: process.env.DB_HOST ?? 'localhost',
      port: Number(process.env.DB_PORT ?? 5432),
      username: process.env.DB_USER ?? 'postgres',
      password: process.env.DB_PASS ?? 'postgres',
      database: process.env.DB_NAME ?? 'brain_agriculture',
      ssl,
    };

export const dataSourceOptions: DataSourceOptions = {
  ...connection,
  entities,
  migrations,
  // O schema é versionado por migrations. `synchronize` fica restrito ao
  // desenvolvimento local; os testes de integração recriam o schema a partir
  // das próprias migrations, garantindo que elas continuem fiéis às entidades.
  synchronize: nodeEnv === 'development',
  dropSchema: isTest,
  migrationsRun: isTest,
  logging: process.env.DB_LOGGING === 'true',
};

export default new DataSource(dataSourceOptions);
