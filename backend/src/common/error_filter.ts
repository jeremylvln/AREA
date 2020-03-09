import {
  ExceptionFilter, Catch, HttpException, ArgumentsHost, HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { BasicResponseObject } from './ro/basic.ro';

@Catch()
export class ErrorFilter implements ExceptionFilter {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  catch(error: Error, host: ArgumentsHost): any {
    console.log(error);

    const res: Response = host.switchToHttp().getResponse();
    const status = (error instanceof HttpException)
      ? error.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    let errorName = error.name;

    if ((error as HttpException).message.error) {
      errorName = (error as HttpException).message.error;
    }

    const ro: BasicResponseObject = {
      error: {
        message: errorName,
        more: error.message,
      },
    };

    return res.status(status).send(ro);
  }
}
