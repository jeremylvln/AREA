import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly users: Repository<User>,
  ) {}

  async getUserByEmail(email: string): Promise<User | undefined> {
    return this.users.findOne({
      where: { email },
    });
  }

  async saveUser(user: Partial<User>): Promise<User> {
    return this.users.save(user);
  }

  async hasUserWithEmail(email: string): Promise<boolean> {
    return await this.users.count({ email }) !== 0;
  }
}
