import { Type } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { validateOrReject } from 'class-validator';

export async function validateDynamicClass<T>(clazz: Type<T>, data): Promise<T> {
  const clazzInstance = plainToClass(clazz, data, {
    excludeExtraneousValues: true,
  });

  await validateOrReject(clazzInstance);
  return clazzInstance;
}
