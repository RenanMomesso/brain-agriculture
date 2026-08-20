import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { DocumentValidator } from '../../common/validators/document-validator';
import {
  CreateProducerDto,
  UpdateProducerDto,
} from './dto/create-producer.dto';
import { CropDto, FarmDto } from './dto/farm.dto';
import { Crop } from './entities/crop.entity';
import { Farm } from './entities/farm.entity';
import { Harvest } from './entities/harvest.entity';
import { Producer } from './entities/producer.entity';

@Injectable()
export class ProducersService {
  private readonly logger = new Logger(ProducersService.name);

  constructor(
    @InjectRepository(Producer)
    private readonly producerRepository: Repository<Producer>,
    @InjectRepository(Crop)
    private readonly cropRepository: Repository<Crop>,
    private readonly dataSource: DataSource,
  ) {}

  async create(dto: CreateProducerDto): Promise<Producer> {
    const document = DocumentValidator.normalize(dto.document);

    const existing = await this.producerRepository.findOne({
      where: { document },
      select: { id: true },
    });
    if (existing) {
      throw new ConflictException(
        'Já existe um produtor cadastrado com este documento',
      );
    }

    const producer = this.producerRepository.create({
      document,
      name: dto.name,
    });
    producer.farms = await this.buildFarms(dto.farms ?? []);

    const saved = await this.producerRepository.save(producer);
    this.logger.log(`Produtor criado id=${saved.id} document=${document}`);

    return saved;
  }

  async findAll(
    page = 1,
    limit = 10,
  ): Promise<{ data: Producer[]; total: number; page: number; limit: number }> {
    const [data, total] = await this.producerRepository.findAndCount({
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data, total, page, limit };
  }

  async findOne(id: string): Promise<Producer> {
    const producer = await this.producerRepository.findOne({ where: { id } });
    if (!producer) {
      throw new NotFoundException(`Produtor ${id} não encontrado`);
    }
    return producer;
  }

  async update(id: string, dto: UpdateProducerDto): Promise<Producer> {
    const producer = await this.findOne(id);

    if (dto.name !== undefined) {
      producer.name = dto.name;
    }

    if (dto.farms !== undefined) {
      await this.replaceFarms(producer, dto.farms);
    } else {
      await this.producerRepository.save(producer);
    }

    this.logger.log(`Produtor atualizado id=${id}`);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const producer = await this.findOne(id);
    await this.producerRepository.remove(producer);
    this.logger.log(`Produtor removido id=${id}`);
  }

  private async replaceFarms(
    producer: Producer,
    farmsDto: FarmDto[],
  ): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      if (producer.farms.length > 0) {
        await manager.remove(producer.farms);
      }
      producer.farms = await this.buildFarms(farmsDto);
      producer.farms.forEach((farm) => (farm.producer = producer));
      await manager.save(producer);
    });
  }

  private async buildFarms(farmsDto: FarmDto[]): Promise<Farm[]> {
    return Promise.all(
      farmsDto.map(async (farmDto) => {
        const farm = new Farm();
        farm.name = farmDto.name;
        farm.city = farmDto.city;
        farm.state = farmDto.state;
        farm.totalArea = farmDto.totalArea;
        farm.agriculturalArea = farmDto.agriculturalArea;
        farm.vegetationArea = farmDto.vegetationArea;

        farm.harvests = await Promise.all(
          (farmDto.harvests ?? []).map(async (harvestDto) => {
            const harvest = new Harvest();
            harvest.label = harvestDto.label;
            harvest.year = harvestDto.year;
            harvest.crops = await this.resolveCrops(harvestDto.crops ?? []);
            return harvest;
          }),
        );

        return farm;
      }),
    );
  }

  private async resolveCrops(cropsDto: CropDto[]): Promise<Crop[]> {
    if (cropsDto.length === 0) return [];

    const names = [...new Set(cropsDto.map((crop) => crop.name))];
    const existing = await this.cropRepository.find({
      where: names.map((name) => ({ name })),
    });
    const existingByName = new Map(existing.map((crop) => [crop.name, crop]));

    for (const name of names) {
      if (!existingByName.has(name)) {
        const created = this.cropRepository.create({ name });
        existingByName.set(name, created);
      }
    }

    return [...existingByName.values()];
  }
}
