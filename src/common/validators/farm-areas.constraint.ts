import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

export const AREA_VALIDATION_MESSAGE =
  'A soma das áreas agricultável e de vegetação não pode ultrapassar a área total da fazenda';

@ValidatorConstraint({ name: 'farmAreas', async: false })
export class FarmAreasConstraint implements ValidatorConstraintInterface {
  validate(_value: unknown, args: ValidationArguments): boolean {
    const farm = args.object as {
      totalArea: number;
      agriculturalArea: number;
      vegetationArea: number;
    };

    if (farm.totalArea === undefined) return true;

    const used = (farm.agriculturalArea ?? 0) + (farm.vegetationArea ?? 0);
    return used <= farm.totalArea;
  }

  defaultMessage(): string {
    return AREA_VALIDATION_MESSAGE;
  }
}

export function FarmAreasValid(validationOptions?: ValidationOptions) {
  return function (target: object): void {
    registerDecorator({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
      target: target as Function,
      propertyName: '',
      options: validationOptions,
      constraints: [],
      validator: FarmAreasConstraint,
    });
  };
}
