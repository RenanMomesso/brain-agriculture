import { DashboardService } from './dashboard.service';

describe('DashboardService', () => {
  let service: DashboardService;
  let queryBuilder: {
    select: jest.Mock;
    addSelect: jest.Mock;
    groupBy: jest.Mock;
    orderBy: jest.Mock;
    innerJoin: jest.Mock;
    getRawOne: jest.Mock;
    getRawMany: jest.Mock;
  };
  let farmRepository: { createQueryBuilder: jest.Mock };

  beforeEach(() => {
    queryBuilder = {
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      innerJoin: jest.fn().mockReturnThis(),
      getRawOne: jest.fn().mockResolvedValue(null),
      getRawMany: jest.fn().mockResolvedValue([]),
    };
    farmRepository = {
      createQueryBuilder: jest.fn(() => queryBuilder),
    };
    service = new DashboardService(farmRepository as never);
  });

  it('retorna totais, estados, culturas e uso do solo', async () => {
    queryBuilder.getRawOne
      .mockResolvedValueOnce({ farmCount: '10', totalArea: '5000.5' })
      .mockResolvedValueOnce({ agricultural: '3200.0', vegetation: '1800.5' });
    queryBuilder.getRawMany
      .mockResolvedValueOnce([
        { state: 'SP', farmCount: '4' },
        { state: 'MG', farmCount: '3' },
      ])
      .mockResolvedValueOnce([
        { crop: 'SOJA', farmCount: '6' },
        { crop: 'MILHO', farmCount: '4' },
      ]);

    const result = await service.getDashboard();

    expect(result).toEqual({
      totalFarms: 10,
      totalAreaHectares: 5000.5,
      farmsByState: [
        { state: 'SP', farmCount: 4 },
        { state: 'MG', farmCount: 3 },
      ],
      farmsByCrop: [
        { crop: 'SOJA', farmCount: 6 },
        { crop: 'MILHO', farmCount: 4 },
      ],
      landUse: {
        agriculturalAreaHectares: 3200,
        vegetationAreaHectares: 1800.5,
      },
    });
  });

  it('retorna zeros quando não há dados', async () => {
    queryBuilder.getRawOne.mockResolvedValue(null);

    const result = await service.getDashboard();

    expect(result.totalFarms).toBe(0);
    expect(result.totalAreaHectares).toBe(0);
    expect(result.landUse).toEqual({
      agriculturalAreaHectares: 0,
      vegetationAreaHectares: 0,
    });
  });
});
