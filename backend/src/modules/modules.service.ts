import { Injectable } from '@nestjs/common';
import { Action, ActionEntity } from './modules.action';
import { Reaction, ReactionEntity } from './modules.reaction';

interface ActionMap {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [id: string]: Action<any, ActionEntity>;
}

interface ReactionMap {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [id: string]: Reaction<any, ReactionEntity>;
}

@Injectable()
export class ModulesService {
  actions: ActionMap = {};

  reactions: ReactionMap = {};

  registerAction<DTO, Entity extends ActionEntity>(
    id: string, action: Action<DTO, Entity>,
  ): void {
    this.actions[id] = action;
  }

  registerReaction<DTO, Entity extends ReactionEntity>(
    id: string, reaction: Reaction<DTO, Entity>,
  ): void {
    this.reactions[id] = reaction;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getActionById = (id: string): Action<any, ActionEntity> | null => {
    if (!(id in this.actions)) return null;
    return this.actions[id];
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getReactionById = (id: string): Reaction<any, any> | null => {
    if (!(id in this.reactions)) return null;
    return this.reactions[id];
  };
}
