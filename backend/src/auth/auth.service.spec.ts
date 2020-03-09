import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { User } from '../users/user.entity';
import { createClassMock } from '../common/helpers/create-class-mock.helper';
import { UsersService } from '../users/users.service';
import * as argon2 from 'argon2';
import { createRequest, createResponse } from 'node-mocks-http';
import { CacheService } from '../cache/cache.service';

describe('AuthService', () => {
  const mockedUsersService = createClassMock(UsersService);
  const mockedCacheService = createClassMock(CacheService);
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockedUsersService,
        },
        {
          provide: CacheService,
          useValue: mockedCacheService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeInstanceOf(AuthService);
  });

  it('should store the user in the session', async () => {
    const req = createRequest({
      session: {},
    });

    const user: User = {
      id: '1',
      email: 'test@localhost',
      firstname: 'Meow',
      lastname: 'Graou',
      workflows: [],
    };

    req.user = user;
    req.session.save = jest.fn((cb) => cb(false));

    const res = createResponse();

    expect(service.logInSession(req, res, false)).resolves.toBeUndefined();
  });

  it('should register a local user', async () => {
    mockedUsersService.hasUserWithEmail.mockResolvedValue(false);
    mockedUsersService.saveUser.mockResolvedValue(null);

    expect(service.registerLocalUser({
      email: 'test@localhost',
      password: 'super_secret',
      firstname: 'Meow',
      lastname: 'Graou',
    })).resolves.toBeDefined();
  });

  it('should not register a local user with existing email', async () => {
    mockedUsersService.hasUserWithEmail.mockResolvedValue(true);

    expect(service.registerLocalUser({
      email: 'test@localhost',
      password: 'super_secret',
      firstname: 'Meow',
      lastname: 'Graou',
    })).rejects.toBeDefined();
  });

  it('should authenticate a local user', async () => {
    const user: User = {
      id: '1',
      email: 'test@localhost',
      firstname: 'Meow',
      lastname: 'Graou',
      password: await argon2.hash('super_secret', { type: argon2.argon2id }),
      workflows: [],
    };

    mockedUsersService.getUserByEmail.mockResolvedValue(user);

    expect(service.authenticateLocalUser({
      email: 'test@localhost',
      password: 'super_secret',
    })).resolves.toMatchObject(user);
  });

  it('should not authenticate a non existing local user', async () => {
    mockedUsersService.getUserByEmail.mockResolvedValue(null);

    expect(service.authenticateLocalUser({
      email: 'test@localhost',
      password: 'super_secret',
    })).rejects.toBeDefined();
  });

  it('should not authenticate a local user with a bad password', async () => {
    const user: User = {
      id: '1',
      email: 'test@localhost',
      firstname: 'Meow',
      lastname: 'Graou',
      password: await argon2.hash('super_secret', { type: argon2.argon2id }),
      workflows: [],
    };

    mockedUsersService.getUserByEmail.mockResolvedValue(user);

    expect(service.authenticateLocalUser({
      email: 'test@localhost',
      password: 'not_the_actual_password',
    })).rejects.toBeDefined();
  });

  it('should create a new user', async () => {
    mockedUsersService.getUserByEmail.mockResolvedValue(null);

    await service.createOrGetUser({
      email: 'test@localhost',
      firstname: 'Meow',
      lastname: 'Graou',
    });

    expect(mockedUsersService.saveUser.mock.calls.length).toEqual(1);
  });

  it('should return an existing user', async () => {
    const user: User = {
      id: '1',
      email: 'test@localhost',
      firstname: 'Meow',
      lastname: 'Graou',
      workflows: [],
    };

    mockedUsersService.getUserByEmail.mockResolvedValue(user);

    const returned = await service.createOrGetUser({
      email: 'test@localhost',
      firstname: 'Meow',
      lastname: 'Graou',
    });

    expect(mockedUsersService.saveUser.mock.calls.length).toEqual(0);
    expect(returned).toMatchObject(user);
  });
});
