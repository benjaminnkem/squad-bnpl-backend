import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { ProductCategory } from '../enums';

export class CreateProductDto {
  @IsString()
  @ApiProperty({
    type: 'string',
    description: 'The name of the product',
  })
  name: string;

  @IsNumber()
  @ApiProperty({ type: 'number', description: 'The price of the product' })
  price: number;

  @IsString()
  @ApiProperty({
    type: 'string',
    description: 'The description of the product',
  })
  description: string;

  @IsEnum(ProductCategory)
  @ApiProperty({ type: 'string', description: 'The category of the product' })
  category: ProductCategory;

  @IsNumber()
  @ApiProperty({
    type: 'number',
    description: 'The stock quantity of the product',
  })
  stockQuantity: number;

  @IsNumber()
  @IsPositive()
  @IsInt()
  @Min(0)
  @Max(100)
  @IsOptional()
  @ApiProperty({
    type: 'number',
    description: 'The discount percentage on the product',
    required: false,
  })
  discount?: number;

  @IsString({ each: true })
  @ApiProperty({
    type: 'array',
    items: { type: 'string' },
    description: 'The images of the product',
  })
  images: string[];
}
