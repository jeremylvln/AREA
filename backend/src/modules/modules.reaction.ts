import { OnModuleInit, Inject } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { CRUDEntity, CRUDObject } from './utils/crud-object.utils';
import { ModulesService } from './modules.service';

export interface ReactionEntity extends CRUDEntity {}

export type ReactionResult = void | 'missing_credentials' | 'errored';

export abstract class Reaction<
  DTO, Entity extends ReactionEntity
> extends CRUDObject<DTO, Entity> implements OnModuleInit {
  @Inject()
  private readonly moduleRef: ModuleRef;

  abstract apply(config: Entity): Promise<ReactionResult>;

  abstract get reactionName(): string;

  onModuleInit(): void {
    this.moduleRef.get(ModulesService, {
      strict: false,
    }).registerReaction(this.reactionName, this);
  }
}
