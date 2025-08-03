import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ErrorResponseDto } from '../dtos/response.dto';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus ? exception.getStatus() : 500;
    const message =
      exception instanceof HttpException
        ? exception.message
        : 'Internal server error';

    // console.log({
    //   exception,
    //   response: exception.getResponse ? exception.getResponse() : null,
    // });

    const errorResponse: ErrorResponseDto<null> = {
      success: false,
      message,
      statusCode: status,
      error: exception.getResponse
        ? exception.getResponse()
        : 'Internal server error',
    };

    response.status(status).json(errorResponse);
  }
}
