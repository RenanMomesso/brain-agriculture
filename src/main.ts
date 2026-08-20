import { ValidationPipe, Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { DataSource } from 'typeorm';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { bufferLogs: false });

  const dataSource = app.get(DataSource);
  if (process.env.MIGRATIONS_RUN_ON_START === 'true') {
    await dataSource.runMigrations();
    Logger.log('Migrations executadas', 'Bootstrap');
  }

  app.setGlobalPrefix('api');
  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Brain Agriculture API')
    .setDescription(
      'API de gestão de produtores rurais, fazendas, safras e culturas',
    )
    .setVersion('1.0.0')
    .addTag('producers', 'Cadastro de produtores rurais')
    .addTag('dashboard', 'Indicadores e gráficos')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  const port = Number(process.env.PORT ?? 3000);
  // '0.0.0.0' é exigido por plataformas em container (Render, Fly, Railway)
  await app.listen(port, '0.0.0.0');

  Logger.log(`API disponível em http://localhost:${port}/api`, 'Bootstrap');
  Logger.log(`Swagger em http://localhost:${port}/api/docs`, 'Bootstrap');
}

void bootstrap();
