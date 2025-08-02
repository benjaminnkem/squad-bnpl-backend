export class ResponseDto<T> {
  status: string;
  message: string;
  data?: T;
}

export class ErrorResponseDto<T> {
  status: string;
  message: string;
  statusCode: number;
  error?: any;
}
