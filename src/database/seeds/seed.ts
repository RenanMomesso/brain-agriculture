import 'reflect-metadata';
import dataSource from '../data-source';
import { Crop } from '../../modules/producers/entities/crop.entity';
import { Farm } from '../../modules/producers/entities/farm.entity';
import { Harvest } from '../../modules/producers/entities/harvest.entity';
import { Producer } from '../../modules/producers/entities/producer.entity';
import { Logger } from '@nestjs/common';

const logger = new Logger('Seed');

const MOCK_PRODUCERS: Array<{
  document: string;
  name: string;
  farms: Array<{
    name: string;
    city: string;
    state: string;
    totalArea: number;
    agriculturalArea: number;
    vegetationArea: number;
    harvests: Array<{ label: string; year: number; crops: string[] }>;
  }>;
}> = [
  {
    document: '12345678000195',
    name: 'Agro Santa Bárbara Ltda',
    farms: [
      {
        name: 'Fazenda Santa Bárbara',
        city: 'Ribeirão Preto',
        state: 'SP',
        totalArea: 1200,
        agriculturalArea: 800,
        vegetationArea: 400,
        harvests: [
          { label: 'Safra 2021/2022', year: 2022, crops: ['SOJA', 'MILHO'] },
          { label: 'Safra 2022/2023', year: 2023, crops: ['SOJA', 'CAFE'] },
        ],
      },
      {
        name: 'Fazenda Boa Esperança',
        city: 'Uberlândia',
        state: 'MG',
        totalArea: 500,
        agriculturalArea: 300,
        vegetationArea: 200,
        harvests: [{ label: 'Safra 2022/2023', year: 2023, crops: ['MILHO'] }],
      },
    ],
  },
  {
    document: '52998224725',
    name: 'João Alves Pereira',
    farms: [
      {
        name: 'Sítio São José',
        city: 'Cascavel',
        state: 'PR',
        totalArea: 150,
        agriculturalArea: 120,
        vegetationArea: 30,
        harvests: [
          { label: 'Safra 2021/2022', year: 2022, crops: ['SOJA'] },
          { label: 'Safra 2022/2023', year: 2023, crops: ['SOJA', 'MILHO'] },
        ],
      },
    ],
  },
  {
    document: '11144477735',
    name: 'Maria Conceição Souza',
    farms: [
      {
        name: 'Fazenda Cachoeira',
        city: 'Patos de Minas',
        state: 'MG',
        totalArea: 890,
        agriculturalArea: 500,
        vegetationArea: 390,
        harvests: [
          { label: 'Safra 2022/2023', year: 2023, crops: ['CAFE'] },
          { label: 'Safra 2023/2024', year: 2024, crops: ['CAFE', 'SOJA'] },
        ],
      },
      {
        name: 'Fazenda Alto da Serra',
        city: 'Varginha',
        state: 'MG',
        totalArea: 300,
        agriculturalArea: 200,
        vegetationArea: 100,
        harvests: [{ label: 'Safra 2023/2024', year: 2024, crops: ['CAFE'] }],
      },
      {
        name: 'Fazenda Rio Claro',
        city: 'Rio Verde',
        state: 'GO',
        totalArea: 2100,
        agriculturalArea: 1800,
        vegetationArea: 300,
        harvests: [
          {
            label: 'Safra 2021/2022',
            year: 2022,
            crops: ['SOJA', 'MILHO', 'ALGODAO'],
          },
          { label: 'Safra 2022/2023', year: 2023, crops: ['SOJA', 'MILHO'] },
          {
            label: 'Safra 2023/2024',
            year: 2024,
            crops: ['SOJA', 'ALGODAO', 'CANA_DE_ACUCAR'],
          },
        ],
      },
    ],
  },
  {
    document: '98765432000110',
    name: 'Grupo Agroceres do Cerrado',
    farms: [
      {
        name: 'Fazenda do Cerrado',
        city: 'Campo Grande',
        state: 'MS',
        totalArea: 3500,
        agriculturalArea: 2400,
        vegetationArea: 1100,
        harvests: [
          { label: 'Safra 2021/2022', year: 2022, crops: ['SOJA', 'MILHO'] },
          {
            label: 'Safra 2022/2023',
            year: 2023,
            crops: ['SOJA', 'CANA_DE_ACUCAR'],
          },
        ],
      },
      {
        name: 'Fazenda Água Branca',
        city: 'Sinop',
        state: 'MT',
        totalArea: 4700,
        agriculturalArea: 3100,
        vegetationArea: 1600,
        harvests: [
          {
            label: 'Safra 2023/2024',
            year: 2024,
            crops: ['SOJA', 'MILHO', 'ALGODAO'],
          },
        ],
      },
    ],
  },
];

async function seed(): Promise<void> {
  await dataSource.initialize();

  const cropRepository = dataSource.getRepository(Crop);
  const producerRepository = dataSource.getRepository(Producer);
  const farmRepository = dataSource.getRepository(Farm);
  const harvestRepository = dataSource.getRepository(Harvest);

  const existingCount = await producerRepository.count();
  if (existingCount > 0) {
    logger.warn('Banco já possui produtores. Nenhum dado foi inserido.');
    await dataSource.destroy();
    return;
  }

  const cropNames = new Set<string>();
  MOCK_PRODUCERS.forEach((producer) =>
    producer.farms.forEach((farm) =>
      farm.harvests.forEach((harvest) =>
        harvest.crops.forEach((crop) => cropNames.add(crop)),
      ),
    ),
  );
  const crops = [...cropNames].map((name) => cropRepository.create({ name }));
  await cropRepository.save(crops);
  const cropsByName = new Map(crops.map((crop) => [crop.name, crop]));

  for (const mock of MOCK_PRODUCERS) {
    const producer = producerRepository.create({
      document: mock.document,
      name: mock.name,
    });

    producer.farms = mock.farms.map((mockFarm) => {
      const farm = farmRepository.create({
        name: mockFarm.name,
        city: mockFarm.city,
        state: mockFarm.state,
        totalArea: mockFarm.totalArea,
        agriculturalArea: mockFarm.agriculturalArea,
        vegetationArea: mockFarm.vegetationArea,
      });

      farm.harvests = mockFarm.harvests.map((mockHarvest) => {
        const harvest = harvestRepository.create({
          label: mockHarvest.label,
          year: mockHarvest.year,
        });
        harvest.crops = mockHarvest.crops.map((crop) => cropsByName.get(crop)!);
        return harvest;
      });

      return farm;
    });

    await producerRepository.save(producer);
    logger.log(`Produtor inserido: ${mock.name} (${mock.document})`);
  }

  logger.log(`Seed concluído: ${MOCK_PRODUCERS.length} produtores inseridos`);
  await dataSource.destroy();
}

seed().catch((error) => {
  logger.error('Falha ao executar seed', error);
  process.exitCode = 1;
});
