import { Test, TestingModule } from '@nestjs/testing';
import { WorkflowsController } from './workflows.controller';
import { WorkflowsService } from './workflows.service';
import { createClassMock } from '../common/helpers/create-class-mock.helper';
import { ModulesService } from '../modules/modules.service';

describe('Workflows Controller', () => {
  const mockedWorkflowsService = createClassMock(WorkflowsService);
  const mockedModulesService = createClassMock(ModulesService);
  let controller: WorkflowsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WorkflowsController],
      providers: [
        {
          provide: WorkflowsService,
          useValue: mockedWorkflowsService,
        },
        {
          provide: ModulesService,
          useValue: mockedModulesService,
        },
      ],
    }).compile();

    controller = module.get<WorkflowsController>(WorkflowsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
