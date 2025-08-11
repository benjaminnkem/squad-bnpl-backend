import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class CreateCartDto {
  @IsString()
  @ApiProperty({
    description: 'The ID of the product to be added to the cart',
    required: true,
  })
  productId: string;

  @IsNumber()
  @ApiProperty({
    description: 'The quantity of the product to be added to the cart',
    required: true,
  })
  quantity: number;
}
