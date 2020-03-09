import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { createClassMock } from '../common/helpers/create-class-mock.helper';
import { CacheService } from '../cache/cache.service';

describe('Auth Controller', () => {
  const mockedAuthService = createClassMock(AuthService);
  const mockedCacheService = createClassMock(CacheService);
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockedAuthService,
        },
        {
          provide: CacheService,
          useValue: mockedCacheService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should list the authentication methods', () => {
    expect(controller.methods().methods.length).toBeGreaterThan(0);
  });

  it('should register a local user', async () => {
    mockedAuthService.registerLocalUser = jest.fn().mockResolvedValue(null);

    expect(controller.register({
      email: 'test@localhost',
      password: 'super_secret',
      firstname: 'Meow',
      lastname: 'Graou',
    })).resolves.toBeUndefined();
  });
});
