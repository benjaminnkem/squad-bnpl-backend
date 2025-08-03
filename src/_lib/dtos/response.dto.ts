export class ResponseDto<T> {
  success: boolean;
  message: string;
  data?: T;
}

export class ErrorResponseDto<T> {
  success: boolean;
  message: string;
  statusCode: number;
  error?: any;
}
