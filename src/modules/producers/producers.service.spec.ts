import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Crop } from './entities/crop.entity';
import { Producer } from './entities/producer.entity';
import { ProducersService } from './producers.service';

describe('ProducersService', () => {
  let service: ProducersService;
  let producerRepository: {
    findOne: jest.Mock;
    findAndCount: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
    remove: jest.Mock;
  };
  let cropRepository: { find: jest.Mock; create: jest.Mock };
  let dataSource: { transaction: jest.Mock };

  beforeEach(async () => {
    producerRepository = {
      findOne: jest.fn(),
      findAndCount: jest.fn(),
      create: jest.fn((data) => ({ id: 'producer-1', ...data })),
      save: jest.fn(async (entity) => entity),
      remove: jest.fn(async () => undefined),
    };

    cropRepository = {
      find: jest.fn(async () => []),
      create: jest.fn((data) => ({ id: `crop-${data.name}`, ...data })),
    };

    dataSource = {
      transaction: jest.fn(async (fn: (manager: unknown) => Promise<void>) => {
        const manager = { remove: jest.fn(), save: jest.fn() };
        await fn(manager);
      }),
    };

    const module = await Test.createTestingModule({
      providers: [
        ProducersService,
        { provide: getRepositoryToken(Producer), useValue: producerRepository },
        { provide: getRepositoryToken(Crop), useValue: cropRepository },
        { provide: DataSource, useValue: dataSource },
      ],
    }).compile();

    service = module.get(ProducersService);
  });

  describe('create', () => {
    it('normaliza o documento e cria o produtor', async () => {
      producerRepository.findOne.mockResolvedValue(null);

      const result = await service.create({
        document: '123.456.780001-95',
        name: 'Fazenda Teste',
        farms: [],
      });

      expect(producerRepository.findOne).toHaveBeenCalledWith({
        where: { document: '12345678000195' },
        select: { id: true },
      });
      expect(producerRepository.create).toHaveBeenCalledWith({
        document: '12345678000195',
        name: 'Fazenda Teste',
      });
      expect(result.id).toBe('producer-1');
    });

    it('lança ConflictException quando o documento já existe', async () => {
      producerRepository.findOne.mockResolvedValue({ id: 'existing' });

      await expect(
        service.create({ document: '52998224725', name: 'Duplicado' }),
      ).rejects.toBeInstanceOf(ConflictException);
    });
  });

  describe('findAll', () => {
    it('retorna lista paginada', async () => {
      producerRepository.findAndCount.mockResolvedValue([[{ id: 'a' }], 1]);

      const result = await service.findAll(2, 5);

      expect(result).toEqual({
        data: [{ id: 'a' }],
        total: 1,
        page: 2,
        limit: 5,
      });
      expect(producerRepository.findAndCount).toHaveBeenCalledWith({
        order: { createdAt: 'DESC' },
        skip: 5,
        take: 5,
      });
    });
  });

  describe('findOne', () => {
    it('retorna o produtor encontrado', async () => {
      producerRepository.findOne.mockResolvedValue({ id: 'abc' });

      await expect(service.findOne('abc')).resolves.toEqual({ id: 'abc' });
    });

    it('lança NotFoundException quando não existe', async () => {
      producerRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('abc')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('atualiza apenas o nome', async () => {
      const producer = { id: 'abc', name: 'Antigo', farms: [] };
      producerRepository.findOne.mockResolvedValue(producer);

      const result = await service.update('abc', { name: 'Novo' });

      expect(result.name).toBe('Novo');
      expect(producerRepository.save).toHaveBeenCalledWith(producer);
    });
  });

  describe('remove', () => {
    it('remove o produtor existente', async () => {
      producerRepository.findOne.mockResolvedValue({ id: 'abc', farms: [] });

      await service.remove('abc');

      expect(producerRepository.remove).toHaveBeenCalledWith({
        id: 'abc',
        farms: [],
      });
    });

    it('lança NotFoundException quando não existe', async () => {
      producerRepository.findOne.mockResolvedValue(null);

      await expect(service.remove('abc')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });
});
