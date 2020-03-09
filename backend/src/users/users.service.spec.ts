import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('UsersService', () => {
  let service: UsersService;
  let repository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: Repository,
        }
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeInstanceOf(UsersService);
    expect(repository).toBeDefined();
  });

  it('should return an user', async () => {
    const user: User = {
      id: '1',
      email: 'test@localhost',
      firstname: 'Meow',
      lastname: 'Graou',
      workflows: [],
    };

    repository.findOne = jest.fn().mockResolvedValue(user);
    expect(service.getUserByEmail('test@localhost')).resolves.toMatchObject(user);
  });

  it('should not return an unknown user', async () => {
    repository.findOne = jest.fn().mockResolvedValue(null);
    expect(service.getUserByEmail('test@localhost')).resolves.toBeNull();
  });

  it('should save a new user', async () => {
    const user: User = {
      id: '1',
      email: 'test@localhost',
      firstname: 'Meow',
      lastname: 'Graou',
      workflows: [],
    };

    repository.save = jest.fn().mockResolvedValue(user);
    expect(service.saveUser(user)).resolves.toMatchObject(user);
  });

  it('should find an existing user', async () => {
    repository.count = jest.fn().mockResolvedValue(1);
    expect(service.hasUserWithEmail('test@localhost')).resolves.toEqual(true);
  });

  it('should not find an unknown user', async () => {
    repository.count = jest.fn().mockResolvedValue(0);
    expect(service.hasUserWithEmail('test@localhost')).resolves.toEqual(false);
  })
});
