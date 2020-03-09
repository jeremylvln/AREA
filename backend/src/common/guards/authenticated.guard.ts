import {
  Injectable, CanActivate, ExecutionContext, UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class AuthenticatedGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request: Request = context.switchToHttp().getRequest();

    if (request.isAuthenticated()) {
      return true;
    }

    throw new UnauthorizedException(
      'Authentication is requested to access this resource.',
    );
  }
}
