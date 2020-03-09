import { Injectable } from '@nestjs/common';
import { PassportSerializer } from '@nestjs/passport';
import { UsersService } from '../users/users.service';
import { User } from '../users/user.entity';

@Injectable()
export class SessionSerializer extends PassportSerializer {
  constructor(
    private readonly userService: UsersService,
  ) {
    super();
  }

  serializeUser(user: User, done: (err: Error, userEmail: User['email']) => void): void {
    done(null, user.email);
  }

  deserializeUser(userEmail: User['email'], done: (err: Error, payload: User) => void): void {
    this.userService.getUserByEmail(userEmail).then((user) => {
      done(null, user);
    }).catch((e) => done(e, null));
  }
}
