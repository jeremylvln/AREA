import { User } from '../users/user.entity';

export interface UserBridge {
  id: string;
  user: User;
  createdAt: Date;
  updatedAt: Date;
}
