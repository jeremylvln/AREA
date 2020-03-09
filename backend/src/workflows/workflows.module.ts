import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkflowsService } from './workflows.service';
import { WorkflowEntity } from './entities/workflow.entity';
import { WorkflowActionsEntity } from './entities/workflow.actions.entity';
import { WorkflowReactionsEntity } from './entities/workflow.reactions.entity';
import { WorkflowsController } from './workflows.controller';
import { ModulesModule } from '../modules/modules.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      WorkflowEntity,
      WorkflowActionsEntity,
      WorkflowReactionsEntity,
    ]),
    ModulesModule,
  ],
  providers: [WorkflowsService],
  controllers: [WorkflowsController],
  exports: [WorkflowsService],
})
export class WorkflowsModule {}
