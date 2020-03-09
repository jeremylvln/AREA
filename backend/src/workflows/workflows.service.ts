import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
import { User } from '../users/user.entity';
import { WorkflowEntity } from './entities/workflow.entity';
import { WorkflowActionsEntity } from './entities/workflow.actions.entity';
import { WorkflowReactionsEntity } from './entities/workflow.reactions.entity';

@Injectable()
export class WorkflowsService {
  constructor(
    @InjectRepository(WorkflowEntity)
    private readonly workflowRepository: Repository<WorkflowEntity>,

    @InjectRepository(WorkflowActionsEntity)
    private readonly workflowActionsRepository: Repository<WorkflowActionsEntity>,

    @InjectRepository(WorkflowReactionsEntity)
    private readonly workflowReactionsRepository: Repository<WorkflowReactionsEntity>,
  ) {}

  async createWorkflow(user: User, name: string): Promise<WorkflowEntity> {
    const workflow: DeepPartial<WorkflowEntity> = {
      name,
      enabled: true,
      actions: [],
      reactions: [],
      owner: user,
    };

    return this.workflowRepository.save(workflow);
  }

  async saveWorkflow(workflow: WorkflowEntity): Promise<WorkflowEntity> {
    return this.workflowRepository.save(workflow);
  }

  async deleteWorkflow(workflow: WorkflowEntity): Promise<void> {
    await this.workflowRepository.delete(workflow);
  }

  async getWorkflows(): Promise<WorkflowEntity[]> {
    return this.workflowRepository.find({
      relations: ['actions', 'reactions'],
    });
  }

  async getWorkflowById(id: string): Promise<WorkflowEntity> {
    return this.workflowRepository.findOne({
      where: {
        id,
      },
      relations: ['actions', 'reactions', 'owner'],
    });
  }

  async getWorkflowsByOwner(owner: User): Promise<WorkflowEntity[]> {
    return this.workflowRepository.find({
      where: {
        owner,
      },
      relations: ['actions', 'reactions'],
    });
  }

  async addActionToWorkflow(
    workflow: WorkflowEntity, actionKind: string, actionId: string,
  ): Promise<void> {
    const action: DeepPartial<WorkflowActionsEntity> = {
      workflow,
      actionKind,
      actionId,
    };

    await this.workflowActionsRepository.save(action);
  }

  async removeActionFromWorkflow(
    workflow: WorkflowEntity, actionKind: string, actionId: string,
  ): Promise<void> {
    await this.workflowActionsRepository.delete({
      workflow,
      actionKind,
      actionId,
    });

    // if (workflow.actions.length === 1 && workflow.reactions.length === 0) {
    //   await this.workflowRepository.delete(workflow);
    // }
  }

  async addReactionToWorkflow(
    workflow: WorkflowEntity, reactionKind: string, reactionId: string,
  ): Promise<void> {
    const action: DeepPartial<WorkflowReactionsEntity> = {
      workflow,
      reactionKind,
      reactionId,
    };

    await this.workflowReactionsRepository.save(action);
  }

  async removeReactionFromWorkflow(
    workflow: WorkflowEntity, reactionKind: string, reactionId: string,
  ): Promise<void> {
    await this.workflowReactionsRepository.delete({
      workflow,
      reactionKind,
      reactionId,
    });

    // if (workflow.actions.length === 0 && workflow.reactions.length === 1) {
    //   await this.workflowRepository.delete(workflow);
    // }
  }
}
