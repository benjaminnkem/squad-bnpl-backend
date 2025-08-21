import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsLowercase, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  @MinLength(3)
  firstName: string;

  @ApiProperty()
  @IsString()
  @MinLength(3)
  lastName: string;

  @ApiProperty()
  @IsString()
  @MinLength(3)
  @IsLowercase()
  username: string;

  @ApiProperty()
  @IsString()
  @MinLength(8)
  // @Exclude()
  password: string;
}

export class ResetPasswordDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  @MinLength(8)
  newPassword: string;
}

export class ForgotPasswordDto {
  @ApiProperty()
  @IsEmail()
  email: string;
}

export class ResendOtpDto {
  @ApiProperty()
  @IsEmail()
  email: string;
}

export class VerifyEmailDto {
  @ApiProperty()
  @IsString()
  otp: string;

  @ApiProperty()
  @IsEmail()
  email: string;
}
