import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { DocumentValidator } from './document-validator';

@ValidatorConstraint({ name: 'isCpfOrCnpj', async: false })
export class IsCpfOrCnpjConstraint implements ValidatorConstraintInterface {
  validate(value: string): boolean {
    return (
      typeof value === 'string' && DocumentValidator.isValidDocument(value)
    );
  }

  defaultMessage(args: ValidationArguments): string {
    return `${args.property} deve ser um CPF ou CNPJ válido`;
  }
}

export function IsCpfOrCnpj(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsCpfOrCnpjConstraint,
    });
  };
}
