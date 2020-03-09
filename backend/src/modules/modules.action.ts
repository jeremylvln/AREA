import { OnModuleInit, Inject } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { CRUDEntity, CRUDObject } from './utils/crud-object.utils';
import { ModulesService } from './modules.service';

export interface ActionEntity extends CRUDEntity {}

export type ActionResult = boolean | 'missing_credentials' | 'errored';

export abstract class Action<
  DTO, Entity extends ActionEntity
> extends CRUDObject<DTO, Entity> implements OnModuleInit {
  @Inject()
  private readonly moduleRef: ModuleRef;

  abstract test(config: Entity): Promise<ActionResult>;

  abstract get actionName(): string;

  onModuleInit(): void {
    this.moduleRef.get(ModulesService, {
      strict: false,
    }).registerAction(this.actionName, this);
  }
}
