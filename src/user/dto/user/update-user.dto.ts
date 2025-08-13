import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUrl } from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'The full name of the user',
    example: 'John Doe',
  })
  fullName?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'The username of the user',
    example: 'johndoe',
  })
  username?: string;

  @IsUrl()
  @IsOptional()
  @ApiProperty({
    description: 'The display picture URL of the user',
    example: 'https://example.com/dp.jpg',
  })
  dp?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'The phone number of the user',
    example: '+1234567890',
  })
  phone?: string;
}
