import { IsBoolean, IsIn, IsNumber, IsOptional } from 'class-validator';

export class UploadDto {
  @IsOptional()
  @IsNumber()
  width?: number;

  @IsOptional()
  @IsNumber()
  height?: number;

  @IsOptional()
  @IsNumber()
  quality?: number;

  @IsOptional()
  @IsIn(['jpeg', 'png', 'webp'])
  format?: 'jpeg' | 'png' | 'webp';

  @IsOptional()
  @IsBoolean()
  createThumbnail?: boolean;
}
