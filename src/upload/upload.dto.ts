import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsIn, IsNumber, IsOptional } from 'class-validator';

export class UploadDto {
  @ApiProperty({
    type: 'number',
    example: 300,
  })
  @IsOptional()
  @IsNumber()
  width?: number;

  @ApiProperty({
    type: 'number',
    example: 300,
  })
  @IsOptional()
  @IsNumber()
  height?: number;

  @ApiProperty({
    type: 'number',
    example: 80,
  })
  @IsOptional()
  @IsNumber()
  quality?: number;

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
