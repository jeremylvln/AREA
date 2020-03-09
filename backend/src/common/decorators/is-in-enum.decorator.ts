import { ValidationOptions, registerDecorator } from "class-validator";
import { COMPARISON_SYMBOLS } from "modules/utils/comparison.utils";

export function IsInEnum<T>(values: Array<T>, validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isComparison',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [],
      options: validationOptions,
      validator: {
        validate(value: T) {
          return values.includes(value);
        },
      },
    });
  };
}

export function IsComparison(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isComparison',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [],
      options: validationOptions,
      validator: {
        validate(value: any) {
          return typeof value === 'string' && COMPARISON_SYMBOLS.includes(value);
        },
      },
    });
  };
}