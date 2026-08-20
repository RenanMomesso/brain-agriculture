import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Brain Agriculture API (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  const validProducer = {
    document: '529.982.247-25',
    name: 'João Teste',
    farms: [
      {
        name: 'Fazenda Teste',
        city: 'Cascavel',
        state: 'PR',
        totalArea: 100,
        agriculturalArea: 60,
        vegetationArea: 40,
        harvests: [
          { label: 'Safra 2021/2022', year: 2022, crops: [{ name: 'SOJA' }] },
          { label: 'Safra 2022/2023', year: 2023, crops: [{ name: 'MILHO' }] },
        ],
      },
    ],
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    dataSource = app.get(DataSource);
    await dataSource.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
  });

  afterEach(async () => {
    await dataSource.query(
      'TRUNCATE TABLE harvest_crops, harvests, farms, producers, crops CASCADE',
    );
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/producers', () => {
    it('cria produtor com fazendas, safras e culturas (201)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/producers')
        .send(validProducer);

      expect(res.status).toBe(201);
      expect(res.body.id).toBeDefined();
      expect(res.body.document).toBe('52998224725');
      expect(res.body.name).toBe('João Teste');
      expect(res.body.farms).toHaveLength(1);
      expect(res.body.farms[0].harvests).toHaveLength(2);
      expect(res.body.farms[0].harvests[0].crops[0].name).toBe('SOJA');
    });

    it('aceita produtor sem fazendas (201)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/producers')
        .send({ document: '111.444.777-35', name: 'Sem Fazenda' });

      expect(res.status).toBe(201);
      expect(res.body.farms).toEqual([]);
    });

    it('rejeita documento duplicado (409)', async () => {
      await request(app.getHttpServer())
        .post('/api/producers')
        .send(validProducer);

      const res = await request(app.getHttpServer())
        .post('/api/producers')
        .send(validProducer);

      expect(res.status).toBe(409);
    });

    it('rejeita CPF inválido (400)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/producers')
        .send({ document: '123.456.789-01', name: 'CPF Ruim' });

      expect(res.status).toBe(400);
    });

    it('rejeita CNPJ inválido (400)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/producers')
        .send({ document: '12.345.678/0001-90', name: 'CNPJ Ruim' });

      expect(res.status).toBe(400);
    });

    it('rejeita área total menor que a soma das áreas (400)', async () => {
      const invalid = structuredClone(validProducer);
      invalid.farms[0].vegetationArea = 50;

      const res = await request(app.getHttpServer())
        .post('/api/producers')
        .send(invalid);

      expect(res.status).toBe(400);
      expect(res.body.message.join(' ')).toContain('não pode ultrapassar');
    });

    it('rejeita cultura fora do catálogo (400)', async () => {
      const invalid = structuredClone(validProducer);
      invalid.farms[0].harvests[0].crops = [{ name: 'ARROZ' }];

      const res = await request(app.getHttpServer())
        .post('/api/producers')
        .send(invalid);

      expect(res.status).toBe(400);
    });

    it('rejeita campos não permitidos (whitelist, 400)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/producers')
        .send({ document: '52998224725', name: 'X', extra: 'hack' });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/producers', () => {
    it('lista produtores paginado', async () => {
      await request(app.getHttpServer())
        .post('/api/producers')
        .send(validProducer);
      await request(app.getHttpServer())
        .post('/api/producers')
        .send({ document: '111.444.777-35', name: 'Maria' });

      const res = await request(app.getHttpServer()).get(
        '/api/producers?page=1&limit=1',
      );

      expect(res.status).toBe(200);
      expect(res.body.total).toBe(2);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.page).toBe(1);
    });
  });

  describe('GET /api/producers/:id', () => {
    it('retorna produtor pelo id (200)', async () => {
      const created = await request(app.getHttpServer())
        .post('/api/producers')
        .send(validProducer);

      const res = await request(app.getHttpServer()).get(
        `/api/producers/${created.body.id}`,
      );

      expect(res.status).toBe(200);
      expect(res.body.document).toBe('52998224725');
    });

    it('retorna 404 para id inexistente', async () => {
      const res = await request(app.getHttpServer()).get(
        '/api/producers/00000000-0000-4000-8000-000000000000',
      );

      expect(res.status).toBe(404);
    });
  });

  describe('PATCH /api/producers/:id', () => {
    it('atualiza o nome do produtor (200)', async () => {
      const created = await request(app.getHttpServer())
        .post('/api/producers')
        .send(validProducer);

      const res = await request(app.getHttpServer())
        .patch(`/api/producers/${created.body.id}`)
        .send({ name: 'João Atualizado' });

      expect(res.status).toBe(200);
      expect(res.body.name).toBe('João Atualizado');
    });

    it('substitui as fazendas ao enviar farms (200)', async () => {
      const created = await request(app.getHttpServer())
        .post('/api/producers')
        .send(validProducer);

      const res = await request(app.getHttpServer())
        .patch(`/api/producers/${created.body.id}`)
        .send({
          farms: [
            {
              name: 'Fazenda Nova',
              city: 'Londrina',
              state: 'PR',
              totalArea: 50,
              agriculturalArea: 30,
              vegetationArea: 20,
              harvests: [
                {
                  label: 'Safra 2023/2024',
                  year: 2024,
                  crops: [{ name: 'SOJA' }],
                },
              ],
            },
          ],
        });

      expect(res.status).toBe(200);
      expect(res.body.farms).toHaveLength(1);
      expect(res.body.farms[0].name).toBe('Fazenda Nova');
    });
  });

  describe('DELETE /api/producers/:id', () => {
    it('remove produtor e fazendas (204)', async () => {
      const created = await request(app.getHttpServer())
        .post('/api/producers')
        .send(validProducer);

      const res = await request(app.getHttpServer()).delete(
        `/api/producers/${created.body.id}`,
      );

      expect(res.status).toBe(204);

      const after = await request(app.getHttpServer()).get(
        `/api/producers/${created.body.id}`,
      );
      expect(after.status).toBe(404);
    });
  });

  describe('GET /api/dashboard', () => {
    it('retorna totais e dados dos gráficos', async () => {
      await request(app.getHttpServer())
        .post('/api/producers')
        .send(validProducer);
      await request(app.getHttpServer())
        .post('/api/producers')
        .send({
          document: '11.222.333/0001-81',
          name: 'Empresa Agrícola',
          farms: [
            {
              name: 'Fazenda Cerrado',
              city: 'Campo Grande',
              state: 'MS',
              totalArea: 200,
              agriculturalArea: 150,
              vegetationArea: 50,
              harvests: [
                {
                  label: 'Safra 2022/2023',
                  year: 2023,
                  crops: [{ name: 'SOJA' }, { name: 'MILHO' }],
                },
              ],
            },
          ],
        });

      const res = await request(app.getHttpServer()).get('/api/dashboard');

      expect(res.status).toBe(200);
      expect(res.body.totalFarms).toBe(2);
      expect(res.body.totalAreaHectares).toBe(300);
      expect(res.body.landUse).toEqual({
        agriculturalAreaHectares: 210,
        vegetationAreaHectares: 90,
      });
      expect(res.body.farmsByState).toEqual(
        expect.arrayContaining([
          { state: 'PR', farmCount: 1 },
          { state: 'MS', farmCount: 1 },
        ]),
      );
      expect(res.body.farmsByCrop).toEqual(
        expect.arrayContaining([
          { crop: 'SOJA', farmCount: 2 },
          { crop: 'MILHO', farmCount: 2 },
        ]),
      );
    });
  });
});
