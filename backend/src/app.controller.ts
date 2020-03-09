import { Controller, Get, Req } from '@nestjs/common';
import { Request } from 'express';
import { ModulesService } from './modules/modules.service';

interface AboutServiceRo {
  name: string;
  actions: {
    name: string;
    description: string;
  }[];
  reactions: {
    name: string;
    description: string;
  }[];
}

interface AboutRo {
  client: {
    host: string;
  };
  server: {
    current_time: number;
    services: AboutServiceRo[];
  }
}

@Controller()
export class AppController {
  constructor(private readonly modulesService: ModulesService) {}

  @Get('/about.json')
  about(@Req() req: Request): AboutRo {
    const services = {};

    Object.values(this.modulesService.actions).forEach(action => {
      if (!(action.service in services)) {
        services[action.service] = {
          name: action.service,
          actions: [],
          reactions: [],
        };
      }

      services[action.service].actions.push({
        name: action.name,
        description: action.description,
      });
    });

    Object.values(this.modulesService.reactions).forEach(reaction => {
      if (!(reaction.service in services)) {
        services[reaction.service] = {
          name: reaction.service,
          actions: [],
          reactions: [],
        };
      }

      services[reaction.service].reactions.push({
        name: reaction.name,
        description: reaction.description,
      });
    });

    return {
      client: {
        host: req.ip,
      },
      server: {
        current_time: Math.floor(new Date().getTime() / 1000),
        services: Object.values(services),
      },
    };
  }
}
