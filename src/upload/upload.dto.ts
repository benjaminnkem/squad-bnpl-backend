import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class UploadDto {
  @ApiProperty({
    type: 'string',
    example: '300',
  })
  @IsString()
  @IsOptional()
  width?: string;

  @ApiProperty({
    type: 'string',
    example: '300',
  })
  @IsString()
  @IsOptional()
  height?: string;

  @ApiProperty({
    type: 'string',
    example: '80',
  })
  @IsString()
  @IsOptional()
  quality?: string;

  @ApiProperty({
    type: 'string',
    enum: ['jpeg', 'png', 'webp'],
    example: 'jpeg',
  })
  @IsOptional()
  @IsIn(['jpeg', 'png', 'webp'])
  format?: 'jpeg' | 'png' | 'webp';

  @ApiProperty({
    type: 'boolean',
    example: true,
    description: 'Whether to create a thumbnail of the image',
  })
  @IsOptional()
  @IsBoolean()
  createThumbnail?: boolean;
}
