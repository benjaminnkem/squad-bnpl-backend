import { IsNumber, IsNumberString, IsOptional } from 'class-validator';

export class QueryProductDto {
  @IsNumberString()
  @IsOptional()
  limit: number;

  @IsNumberString()
  @IsOptional()
  page: number;
}
