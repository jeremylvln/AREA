import { Test, TestingModule } from '@nestjs/testing';
import { WorkflowsService } from './workflows.service';
import { ModulesService } from '../modules/modules.service';
import { createClassMock } from '../common/helpers/create-class-mock.helper';
import { Repository } from 'typeorm';
import { WorkflowEntity } from './entities/workflow.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { WorkflowActionsEntity } from './entities/workflow.actions.entity';
import { WorkflowReactionsEntity } from './entities/workflow.reactions.entity';

describe('WorkflowsService', () => {
  const mockedModulesService = createClassMock(ModulesService);
  let service: WorkflowsService;
  let repository: Repository<WorkflowEntity>;
  let repositoryActions: Repository<WorkflowActionsEntity>;
  let repositoryReactions: Repository<WorkflowReactionsEntity>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkflowsService,
        {
          provide: ModulesService,
          useValue: mockedModulesService,
        },
        {
          provide: getRepositoryToken(WorkflowEntity),
          useValue: Repository,
        },
        {
          provide: getRepositoryToken(WorkflowActionsEntity),
          useValue: Repository,
        },
        {
          provide: getRepositoryToken(WorkflowReactionsEntity),
          useValue: Repository,
        },
      ],
    }).compile();

    service = module.get<WorkflowsService>(WorkflowsService);
    repository = module.get<Repository<WorkflowEntity>>(getRepositoryToken(WorkflowEntity));
    repositoryActions = module.get<Repository<WorkflowActionsEntity>>(getRepositoryToken(WorkflowActionsEntity));
    repositoryReactions = module.get<Repository<WorkflowReactionsEntity>>(getRepositoryToken(WorkflowReactionsEntity));
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeInstanceOf(WorkflowsService);
    expect(repository).toBeDefined();
    expect(repositoryActions).toBeDefined();
    expect(repositoryReactions).toBeDefined();
  });
});
