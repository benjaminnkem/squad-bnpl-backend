import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsUUID } from 'class-validator';

export class CreateCartDto {
  @IsUUID()
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
