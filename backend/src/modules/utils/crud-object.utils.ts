import { Repository, DeepPartial } from 'typeorm';
import { Type } from '@nestjs/common';
import { User } from '../../users/user.entity';
import { validateDynamicClass } from '../../common/helpers/validate-dynamic.helper';
import { Form } from '../modules.form';

export interface CRUDEntity {
  instanceId: string;
  owner: User;
}

export abstract class CRUDObject<
  DTO, Entity extends CRUDEntity
> {
  abstract get service(): string;
  abstract get name(): string;
  abstract get description(): string;
  abstract get form(): Form;

  abstract dtoToEntity(dto: DTO): DeepPartial<Entity>;

  abstract createTestEntity(testOwner: User): Entity;

  abstract get entityRepository(): Repository<Entity>;

  abstract get dtoClass(): Type<DTO>;

  async getInstance(instanceId: string): Promise<Entity> {
    return this.entityRepository.findOne({
      where: {
        instanceId,
      },
      relations: ['owner'],
    });
  }

  async getInstances(): Promise<Entity[]> {
    return this.entityRepository.find();
  }

  async createInstance(dto: DTO, owner: User): Promise<Entity> {
    const entity = this.dtoToEntity(dto);
    entity.owner = owner as any;

    return this.entityRepository.save(entity);
  }

  async updateInstance(instance: Entity, dto: DTO): Promise<Entity> {
    const newEntity = this.dtoToEntity(dto);

    return this.entityRepository.save({
      ...instance,
      ...newEntity,
    });
  }

  async deleteInstance(instance: Entity): Promise<void> {
    await this.entityRepository.delete(instance.instanceId);
  }

  async hasInstance(instanceId: string): Promise<boolean> {
    return await this.entityRepository.count({
      where: {
        instanceId,
      },
    }) !== 0;
  }

  validateDto(data: any): Promise<DTO> {
    return validateDynamicClass(this.dtoClass, data);
  }

  get authTokenProvider(): string | null {
    return null;
  }
}