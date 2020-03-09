import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  Logger,
  CallHandler,
} from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<[]> {
    const req = context.switchToHttp().getRequest();

    if (req) {
      const now = Date.now();
      const method = req.method;
      let url: string = req.url;

      if (url.includes('?'))
        url = url.substring(0, url.indexOf('?'));

      Logger.log(`${method} ${url}`, context.getClass().name);
        
      return next
        .handle()
        .pipe(
          tap(() =>
            Logger.log(
              `${method} ${url} (done in ${Date.now() - now}ms)`,
              context.getClass().name,
            ),
          ),
        );
    }

    return of([]);
  }
}