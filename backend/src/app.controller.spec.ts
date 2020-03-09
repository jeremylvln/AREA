import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { ModulesService } from './modules/modules.service';
import { createClassMock } from './common/helpers/create-class-mock.helper';

describe('App Controller', () => {
  const mockedModulesService = createClassMock(ModulesService);
  let controller: AppController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: ModulesService,
          useValue: mockedModulesService,
        },
      ],
    }).compile();

    controller = module.get<AppController>(AppController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
