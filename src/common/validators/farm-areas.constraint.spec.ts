import { FarmAreasConstraint } from './farm-areas.constraint';

describe('FarmAreasConstraint', () => {
  const constraint = new FarmAreasConstraint();

  const validate = (areas: {
    totalArea: number;
    agriculturalArea: number;
    vegetationArea: number;
  }) => constraint.validate(null, { object: areas } as never);

  it('aceita quando a soma é igual à área total', () => {
    expect(
      validate({ totalArea: 100, agriculturalArea: 60, vegetationArea: 40 }),
    ).toBe(true);
  });

  it('aceita quando a soma é menor que a área total', () => {
    expect(
      validate({ totalArea: 100, agriculturalArea: 50, vegetationArea: 30 }),
    ).toBe(true);
  });

  it('rejeita quando a soma ultrapassa a área total', () => {
    expect(
      validate({ totalArea: 100, agriculturalArea: 70, vegetationArea: 40 }),
    ).toBe(false);
  });

  it('aceita áreas parcialmente preenchidas (somente agricultável)', () => {
    expect(
      validate({
        totalArea: 100,
        agriculturalArea: 100,
        vegetationArea: undefined as unknown as number,
      }),
    ).toBe(true);
  });

  it('ignora validação quando totalArea não está presente', () => {
    expect(
      validate({
        totalArea: undefined as unknown as number,
        agriculturalArea: 10,
        vegetationArea: 10,
      }),
    ).toBe(true);
  });
});
