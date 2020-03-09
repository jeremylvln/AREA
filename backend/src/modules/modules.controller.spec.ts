import { Test, TestingModule } from '@nestjs/testing';
import { ModulesController } from './modules.controller';
import { createClassMock } from '../common/helpers/create-class-mock.helper';
import { ModulesService } from './modules.service';

describe('Modules Controller', () => {
  const mockedModulesService = createClassMock(ModulesService);
  let controller: ModulesController;
  let service: ModulesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ModulesController],
      providers: [
        {
          provide: ModulesService,
          useValue: mockedModulesService,
        },
      ],
    }).compile();

    controller = module.get<ModulesController>(ModulesController);
    service = module.get<ModulesService>(ModulesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });
});
