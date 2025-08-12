import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateMerchantDto {
  @IsString()
  @MinLength(3)
  @ApiProperty({
    description: 'The name of the merchant',
    example: 'Tech Store',
  })
  businessName: string;

  @IsString()
  @MinLength(3)
  @MaxLength(20)
  @ApiProperty({
    description: 'The unique registration number of the merchant',
  })
  registrationNumber: string;

  @IsEmail()
  @ApiProperty({
    description: 'The email address of the merchant',
    example: 'techstore@example.com',
  })
  email: string;

  @IsString()
  @MinLength(3)
  @ApiProperty({
    description: 'The address of the merchant',
    example: '123 Tech Street',
  })
  address: string;

  @IsString()
  @MinLength(10)
  @MaxLength(15)
  @ApiProperty({
    description: 'The phone number of the merchant',
    example: '+23480908989',
  })
  phone: string;

  @IsUrl()
  @ApiProperty({
    description: 'The photo URL of the merchant',
    example: 'https://example.com/photo.jpg',
  })
  photo: string;

  @IsUrl()
  @IsOptional()
  @ApiProperty({
    description: 'The cover photo URL of the merchant',
    example: 'https://example.com/cover.jpg',
  })
  coverPhoto: string;

  @IsString()
  @MinLength(3)
  @MaxLength(1000)
  @IsOptional()
  @ApiProperty({
    description: 'A brief bio of the merchant',
    example:
      'We are a tech store providing the latest gadgets and accessories.',
  })
  bio: string;

  @IsUrl()
  @IsOptional()
  @ApiProperty({
    description: 'The website URL of the merchant',
    example: 'https://techstore.com',
  })
  website: string;
}
