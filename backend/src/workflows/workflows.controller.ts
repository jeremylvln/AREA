import {
  Controller, Get, Post, Delete, Param, Res, Body, HttpCode, HttpStatus, UseGuards, Put,
} from '@nestjs/common';
import { Response } from 'express';
import { ModulesService } from '../modules/modules.service';
import { BasicResponseObject } from '../common/ro/basic.ro';
import { WorkflowEntity } from './entities/workflow.entity';
import { WorkflowsService } from './workflows.service';
import { WorkflowDto, WorkflowObjectDto, WorkflowEnableDto } from './workflow.dto';
import { AuthenticatedGuard } from '../common/guards/authenticated.guard';
import { CurrentUser } from '../common/current-user.decorator';

@Controller('workflows')
export class WorkflowsController {
  constructor(
    private readonly workflowService: WorkflowsService,
    private readonly modulesService: ModulesService,
  ) {}

  @Get()
  @UseGuards(AuthenticatedGuard)
  async getAllWorkflows(@CurrentUser() user): Promise<WorkflowEntity[]> {
    const workflows = await this.workflowService.getWorkflowsByOwner(user);

    await Promise.all(workflows.map(async (workflow) => {
      workflow.actions = await Promise.all(workflow.actions.map(async (action) => ({
        ...action,
        service: this.modulesService.getActionById(action.actionKind).service,
        name: this.modulesService.getActionById(action.actionKind).name,
        description: this.modulesService.getActionById(action.actionKind).description,
        instance: await this.modulesService.getActionById(action.actionKind).getInstance(action.actionId),
      })));
  
      workflow.reactions = await Promise.all(workflow.reactions.map(async (reaction) => ({
        ...reaction,
        service: this.modulesService.getReactionById(reaction.reactionKind).service,
        name: this.modulesService.getReactionById(reaction.reactionKind).name,
        description: this.modulesService.getReactionById(reaction.reactionKind).description,
        instance: await this.modulesService.getReactionById(reaction.reactionKind).getInstance(reaction.reactionId),
      })));

      delete workflow.owner;
    }));

    return workflows;
  }

  @Get(':id')
  @UseGuards(AuthenticatedGuard)
  async getWorkflow(
    @CurrentUser() user, @Res() res: Response, @Param('id') id: string,
  ): Promise<void> {
    const workflow = await this.workflowService.getWorkflowById(id);

    if (!workflow || workflow.owner.id !== user.id) {
      const error: BasicResponseObject = {
        error: {
          message: 'Workflow not found',
        },
      };
      res.status(404).send(error);
      return;
    }

    const { owner, ...rest } = workflow;

    rest.actions = await Promise.all(rest.actions.map(async (action) => ({
      ...action,
      service: this.modulesService.getActionById(action.actionKind).service,
      name: this.modulesService.getActionById(action.actionKind).name,
      description: this.modulesService.getActionById(action.actionKind).description,
      instance: await this.modulesService.getActionById(action.actionKind).getInstance(action.actionId),
    })));

    rest.reactions = await Promise.all(rest.reactions.map(async (reaction) => ({
      ...reaction,
      service: this.modulesService.getReactionById(reaction.reactionKind).service,
      name: this.modulesService.getReactionById(reaction.reactionKind).name,
      description: this.modulesService.getReactionById(reaction.reactionKind).description,
      instance: await this.modulesService.getReactionById(reaction.reactionKind).getInstance(reaction.reactionId),
    })));

    res.status(200).send(rest);
  }

  @Post()
  @UseGuards(AuthenticatedGuard)
  @HttpCode(HttpStatus.CREATED)
  async createWorkflow(@CurrentUser() user, @Body() body: WorkflowDto): Promise<WorkflowEntity> {
    return this.workflowService.createWorkflow(user, body.name);
  }

  @Put(':id')
  @UseGuards(AuthenticatedGuard)
  async updateWorkflow(
    @CurrentUser() user, @Res() res: Response, @Param('id') id: string,
    @Body() body: WorkflowDto,
  ): Promise<void> {
    const workflow = await this.workflowService.getWorkflowById(id);

    if (!workflow || workflow.owner.id !== user.id) {
      const error: BasicResponseObject = {
        error: {
          message: 'Workflow not found',
        },
      };
      res.status(404).send(error);
      return;
    }

    workflow.name = body.name;

    const updatedWorkflow = await this.workflowService.saveWorkflow(workflow);
    res.status(200).send(updatedWorkflow);
  }

  @Post(':id/enable')
  @UseGuards(AuthenticatedGuard)
  async toggleEnableWorkflow(
    @CurrentUser() user, @Res() res: Response, @Param('id') id: string,
    @Body() body: WorkflowEnableDto,
  ): Promise<void> {
    const workflow = await this.workflowService.getWorkflowById(id);

    if (!workflow || workflow.owner.id !== user.id) {
      const error: BasicResponseObject = {
        error: {
          message: 'Workflow not found',
        },
      };
      res.status(404).send(error);
      return;
    }

    workflow.enabled = body.enabled;
    await this.workflowService.saveWorkflow(workflow);
    res.status(204).send();
  }

  @Delete(':id')
  @UseGuards(AuthenticatedGuard)
  async deleteWorkflow(
    @CurrentUser() user, @Res() res: Response, @Param('id') id: string,
  ): Promise<void> {
    const workflow = await this.workflowService.getWorkflowById(id);

    if (!workflow || workflow.owner.id !== user.id) {
      const error: BasicResponseObject = {
        error: {
          message: 'Workflow not found',
        },
      };
      res.status(404).send(error);
      return;
    }

    await this.workflowService.deleteWorkflow(workflow);
    res.status(204).send();
  }

  @Post(':id/actions')
  @UseGuards(AuthenticatedGuard)
  async addActionToWorkflow(
    @CurrentUser() user, @Res() res: Response, @Param('id') id: string,
      @Body() body: WorkflowObjectDto,
  ): Promise<void> {
    const workflow = await this.workflowService.getWorkflowById(id);

    if (!workflow || workflow.owner.id !== user.id) {
      const error: BasicResponseObject = {
        error: {
          message: 'Workflow not found',
        },
      };
      res.status(404).send(error);
      return;
    }

    const action = this.modulesService.getActionById(body.kind);

    if (!action || !(await action.hasInstance(body.id))) {
      const error: BasicResponseObject = {
        error: {
          message: 'Action not found',
        },
      };
      res.status(404).send(error);
      return;
    }

    await this.workflowService.addActionToWorkflow(workflow, body.kind, body.id);
    res.status(204).send();
  }

  @Post(':id/reactions')
  @UseGuards(AuthenticatedGuard)
  async addReactionToWorkflow(
    @CurrentUser() user, @Res() res: Response, @Param('id') id: string,
      @Body() body: WorkflowObjectDto,
  ): Promise<void> {
    const workflow = await this.workflowService.getWorkflowById(id);

    if (!workflow || workflow.owner.id !== user.id) {
      const error: BasicResponseObject = {
        error: {
          message: 'Workflow not found',
        },
      };
      res.status(404).send(error);
      return;
    }

    const reaction = this.modulesService.getReactionById(body.kind);

    if (!reaction || !(await reaction.hasInstance(body.id))) {
      const error: BasicResponseObject = {
        error: {
          message: 'Reaction not found',
        },
      };
      res.status(404).send(error);
      return;
    }

    await this.workflowService.addReactionToWorkflow(workflow, body.kind, body.id);
    res.status(204).send();
  }

  @Delete(':id/actions/:kind/:aid')
  @UseGuards(AuthenticatedGuard)
  async removeActionFromWorkflow(
    @CurrentUser() user, @Res() res: Response, @Param('id') id: string,
    @Param('kind') kind: string, @Param('aid') aid: string,
  ): Promise<void> {
    const workflow = await this.workflowService.getWorkflowById(id);

    if (!workflow || workflow.owner.id !== user.id) {
      const error: BasicResponseObject = {
        error: {
          message: 'Workflow not found',
        },
      };
      res.status(404).send(error);
      return;
    }

    await this.workflowService.removeActionFromWorkflow(workflow, kind, aid);
    res.status(204).send();
  }

  @Delete(':id/reactions/:kind/:rid')
  @UseGuards(AuthenticatedGuard)
  async removeReactionFromWorkflow(
    @CurrentUser() user, @Res() res: Response, @Param('id') id: string,
      @Param('kind') kind: string, @Param('rid') rid: string,
  ): Promise<void> {
    const workflow = await this.workflowService.getWorkflowById(id);

    if (!workflow || workflow.owner.id !== user.id) {
      const error: BasicResponseObject = {
        error: {
          message: 'Workflow not found',
        },
      };
      res.status(404).send(error);
      return;
    }

    await this.workflowService.removeReactionFromWorkflow(workflow, kind, rid);
    res.status(204).send();
  }
}
