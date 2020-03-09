import {
  Controller, Get, Param, Res, Post, Body, Delete, Put, UseGuards, HttpStatus, HttpCode,
} from '@nestjs/common';
import { Response } from 'express';
import { ModulesService } from './modules.service';
import { BasicResponseObject } from '../common/ro/basic.ro';
import { User } from '../users/user.entity';
import { CRUDObject, CRUDEntity } from './utils/crud-object.utils';
import { AuthenticatedGuard } from '../common/guards/authenticated.guard';
import { CRUDObjectRo } from './modules.ro';
import { CurrentUser } from '../common/current-user.decorator';
import { ValidationError } from 'class-validator';
import { ActionResult } from './modules.action';
import { ReactionResult } from './modules.reaction';

@Controller('modules')
export class ModulesController {
  constructor(private readonly service: ModulesService) {}

  @Get('actions/:id/test')
  @UseGuards(AuthenticatedGuard)
  @HttpCode(HttpStatus.OK)
  async triggerActionTest(@CurrentUser() user, @Param('id') id: string): Promise<ActionResult> {
    return this.service.getActionById(id).test(this.service.getActionById(id).createTestEntity(user));
  }

  @Get('reactions/:id/test')
  @UseGuards(AuthenticatedGuard)
  @HttpCode(HttpStatus.OK)
  async triggerReactionTest(@CurrentUser() user, @Param('id') id: string): Promise<ReactionResult> {
    return this.service.getReactionById(id).apply(this.service.getReactionById(id).createTestEntity(user));
  }

  @Get('actions')
  @UseGuards(AuthenticatedGuard)
  async getActions(): Promise<CRUDObjectRo[]> {
    return Object.values(this.service.actions).map((action) => ({
      id: action.actionName,
      service: action.service,
      name: action.name,
      description: action.description,
      form: action.form,
      authTokenProvider: action.authTokenProvider,
    }));
  }

  @Get('actions/:id/form')
  @UseGuards(AuthenticatedGuard)
  async getActionForm(
    @Param('id') id: string,
    @Res() res: Response,
  ): Promise<void> {
    return this.getForm(this.service.getActionById, id, res);
  }

  @Get('actions/:id/:instanceId')
  @UseGuards(AuthenticatedGuard)
  async getActionInstance(
    @CurrentUser() user,
      @Param('id') id: string,
      @Param('instanceId') instanceId: string,
      @Res() res: Response,
  ): Promise<void> {
    await this.getInstance(this.service.getActionById, user, id, instanceId, res);
  }

  @Post('actions/:id')
  @UseGuards(AuthenticatedGuard)
  async createActionInstance(
    @CurrentUser() user,
      @Param('id') id: string,
      @Body() body,
      @Res() res: Response,
  ): Promise<void> {
    await this.createInstance(this.service.getActionById, user, id, body, res);
  }

  @Put('actions/:id/:instanceId')
  @UseGuards(AuthenticatedGuard)
  async updateActionInstance(
    @CurrentUser() user,
      @Param('id') id: string,
      @Param('instanceId') instanceId: string,
      @Body() body,
      @Res() res: Response,
  ): Promise<void> {
    await this.updateInstance(
      this.service.getActionById, user, id, instanceId, body, res,
    );
  }

  @Delete('actions/:id/:instanceId')
  @UseGuards(AuthenticatedGuard)
  async deleteActionInstance(
    @CurrentUser() user,
      @Param('id') id: string,
      @Param('instanceId') instanceId: string,
      @Res() res: Response,
  ): Promise<void> {
    await this.deleteInstance(this.service.getActionById, user, id, instanceId, res);
  }

  @Get('reactions')
  @UseGuards(AuthenticatedGuard)
  async getReactions(): Promise<CRUDObjectRo[]> {
    return Object.values(this.service.reactions).map((reaction) => ({
      id: reaction.reactionName,
      service: reaction.service,
      name: reaction.name,
      description: reaction.description,
      form: reaction.form,
      authTokenProvider: reaction.authTokenProvider,
    }));
  }

  @Get('reactions/:id/form')
  @UseGuards(AuthenticatedGuard)
  async getReactionForm(
    @Param('id') id: string,
    @Res() res: Response,
  ): Promise<void> {
    return this.getForm(this.service.getReactionById, id, res);
  }

  @Get('reactions/:id/:instanceId')
  @UseGuards(AuthenticatedGuard)
  async getReactionInstance(
    @CurrentUser() user,
      @Param('id') id: string,
      @Param('instanceId') instanceId: string,
      @Res() res: Response,
  ): Promise<void> {
    await this.getInstance(this.service.getReactionById, user, id, instanceId, res);
  }

  @Post('reactions/:id')
  @UseGuards(AuthenticatedGuard)
  async createReactionInstance(
    @CurrentUser() user,
      @Param('id') id: string,
      @Body() body,
      @Res() res: Response,
  ): Promise<void> {
    await this.createInstance(this.service.getReactionById, user, id, body, res);
  }

  @Put('reactions/:id/:instanceId')
  @UseGuards(AuthenticatedGuard)
  async updateReactionInstance(
    @CurrentUser() user,
      @Param('id') id: string,
      @Param('instanceId') instanceId: string,
      @Body() body,
      @Res() res: Response,
  ): Promise<void> {
    await this.updateInstance(
      this.service.getReactionById, user, id, instanceId, body, res,
    );
  }

  @Delete('reactions/:id/:instanceId')
  @UseGuards(AuthenticatedGuard)
  async deleteReactionInstance(
    @CurrentUser() user,
      @Param('id') id: string,
      @Param('instanceId') instanceId: string,
      @Res() res: Response,
  ): Promise<void> {
    await this.deleteInstance(this.service.getReactionById, user, id, instanceId, res);
  }

  async getForm<
    DTO,
    Entity extends CRUDEntity,
    CObject extends CRUDObject<DTO, Entity>,
  >(
    objectProvider: (id: string) => CObject,
    id: string, res: Response
  ): Promise<void> {
    const object = objectProvider(id);

    if (!object) {
      const error: BasicResponseObject = {
        error: {
          message: 'Object not found',
        },
      };
      res.status(404).send(error);
      return;
    }

    res.status(200).send(object.form);
  }

  async getInstance<
    DTO,
    Entity extends CRUDEntity,
    CObject extends CRUDObject<DTO, Entity>,
  >(
    objectProvider: (id: string) => CObject,
    user: User, id: string, instanceId: string, res: Response,
  ): Promise<void> {
    const object = objectProvider(id);

    if (!object) {
      const error: BasicResponseObject = {
        error: {
          message: 'Object not found',
        },
      };
      res.status(404).send(error);
      return;
    }

    const instance = await object.getInstance(instanceId);

    if (!instance || instance.owner.id !== user.id) {
      const error: BasicResponseObject = {
        error: {
          message: 'Object instance not found',
        },
      };
      res.status(404).send(error);
      return;
    }

    res.status(200).send(instance);
  }

  async createInstance<
    DTO,
    Entity extends CRUDEntity,
    CObject extends CRUDObject<DTO, Entity>,
  >(
    objectProvider: (id: string) => CObject,
    user: User, id: string, body, res: Response,
  ): Promise<void> {
    const object = objectProvider(id);

    if (!object) {
      const error: BasicResponseObject = {
        error: {
          message: 'Object not found',
        },
      };
      res.status(404).send(error);
      return;
    }

    try {
      const dto = await object.validateDto(body);
      const instance = await object.createInstance(dto, user);

      res.status(201).send(instance);
    } catch (err) {
      if (Array.isArray(err) && err.length > 0 && err[0] instanceof ValidationError) {
        const error: BasicResponseObject = {
          error: {
            message: 'Bad body',
            more: err,
          },
        };
        res.status(400).send(error);
      } else {
        throw err;
      }
    }
  }

  async updateInstance<
    DTO,
    Entity extends CRUDEntity,
    CObject extends CRUDObject<DTO, Entity>,
  >(
    objectProvider: (id: string) => CObject,
    user: User, id: string, instanceId: string, body, res: Response,
  ): Promise<void> {
    const object = objectProvider(id);

    if (!object) {
      const error: BasicResponseObject = {
        error: {
          message: 'Object not found',
        },
      };
      res.status(404).send(error);
      return;
    }

    const instance = await object.getInstance(instanceId);

    if (!instance || instance.owner.id !== user.id) {
      const error: BasicResponseObject = {
        error: {
          message: 'Object instance not found',
        },
      };
      res.status(404).send(error);
      return;
    }

    try {
      const dto = await object.validateDto(body);
      const modifiedInstance = await object.updateInstance(instance, dto);

      res.status(200).send(modifiedInstance);
    } catch (err) {
      if (err instanceof ValidationError) {
        const error: BasicResponseObject = {
          error: {
            message: 'Bad body',
            more: err,
          },
        };
        res.status(400).send(error);
      } else {
        throw err;
      }
    }
  }

  async deleteInstance<
    DTO,
    Entity extends CRUDEntity,
    CObject extends CRUDObject<DTO, Entity>,
  >(
    objectProvider: (id: string) => CObject,
    user: User, id: string, instanceId: string, res: Response,
  ): Promise<void> {
    const object = objectProvider(id);

    if (!object) {
      const error: BasicResponseObject = {
        error: {
          message: 'Object not found',
        },
      };
      res.status(404).send(error);
      return;
    }

    const instance = await object.getInstance(instanceId);

    if (!instance || instance.owner.id !== user.id) {
      const error: BasicResponseObject = {
        error: {
          message: 'Object instance not found',
        },
      };
      res.status(404).send(error);
      return;
    }

    await object.deleteInstance(instance);
    res.status(204).send();
  }
}
