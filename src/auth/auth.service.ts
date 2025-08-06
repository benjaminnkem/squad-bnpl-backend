import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from '../user/dto/user/create-user.dto';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { MailerService } from '@nestjs-modules/mailer';
import * as ms from 'ms';
import { Otp } from './entities/otp.entity';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private mailerService: MailerService,

    @InjectRepository(User)
    private userRepo: Repository<User>,

    @InjectRepository(Otp)
    private otpRepo: Repository<Otp>,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.userRepo.findOneBy({ email });

    if (!user)
      throw new BadRequestException('A user with this email does not exist');

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid)
      throw new BadRequestException('Invalid email or password');

    if (!user.isVerified) throw new ConflictException('User is not verified');

    const { password: _, ...result } = user;
    return result;
  }

  async register(createUserDto: CreateUserDto) {
    try {
      const userExists = await this.userRepo.findOneBy({
        email: createUserDto.email,
      });

      if (userExists) throw new BadRequestException('User already exists');

      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

      const otp = this.generateOtp();

      await this.mailerService
        .sendMail({
          to: createUserDto.email,
          subject: 'Welcome to SquadBay',
          template: 'verify-email',
          context: {
            otp,
            email: createUserDto.email,
            expirationTime: '24 hours',
          },
        })
        .catch((error) => {
          console.error(`Failed to send verification email: ${error.message}`);
          throw new BadRequestException(
            'Failed to send verification email. Please try again later.',
          );
        });

      const otpPayload = {
        otp,
        email: createUserDto.email,
        expiresAt: new Date(Date.now() + ms('24 hours')),
      };

      const newOtp = this.otpRepo.create(otpPayload);
      await this.otpRepo.save(newOtp);

      const user = this.userRepo.create({
        ...createUserDto,
        password: hashedPassword,
      });

      return await this.userRepo.save(user);
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Registration failed',
      );
    }
  }

  async login(user) {
    const payload = { email: user.email, sub: user.id };

    const refreshTokenSecret =
      this.configService.get<string>('JWT_REFRESH_SECRET');
    const refreshTokenExpiration = this.configService.get<string>(
      'JWT_REFRESH_EXPIRES_IN',
    );

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      secret: refreshTokenSecret,
      expiresIn: refreshTokenExpiration,
    });

    return {
      tokens: { accessToken, refreshToken },
      user: {
        id: user.id,
        email: user.email,
      },
    };
  }

  async verifyEmail(email: string, otp: string) {
    try {
      const otpRecord = await this.otpRepo.findOneBy({
        otp,
        email,
        isUsed: false,
      });

      if (!otpRecord) throw new BadRequestException('Invalid OTP');

      const currentTime = new Date().getTime();
      const expirationTime = new Date(otpRecord.expiresAt).getTime();

      if (currentTime > expirationTime) {
        throw new BadRequestException('OTP has expired');
      }

      const user = await this.userRepo.findOneBy({ email });
      if (!user) throw new BadRequestException('User not found');

      user.isVerified = true;
      await this.userRepo.save(user);

      otpRecord.isUsed = true;
      await this.otpRepo.save(otpRecord);

      return 'Email verified successfully. You can now log in.';
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : 'OTP verification failed',
      );
    }
  }

  async forgotPassword(email: string) {
    try {
      const user = await this.userRepo.findOneBy({ email });
      if (!user) throw new BadRequestException('User not found');

      const otp = this.generateOtp();

      const otpPayload = {
        otp,
        email: user.email,
        expiresAt: new Date(Date.now() + ms('24 hours')),
      };

      const newOtp = this.otpRepo.create(otpPayload);

      await this.mailerService.sendMail({
        to: user.email,
        subject: 'Forgot Password - SquadBay',
        template: 'forgot-password',
        context: {
          otp,
          email: user.email,
          expirationTime: '24 hours',
        },
      });

      await this.otpRepo.save(newOtp);

      return 'OTP sent to your email. Please check your inbox.';
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Forgot password failed',
      );
    }
  }

  async resetPassword(email: string, newPassword: string) {
    try {
      const user = await this.userRepo.findOneBy({ email });
      if (!user) throw new BadRequestException('User not found');

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      user.password = hashedPassword;
      await this.userRepo.save(user);
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Password reset failed',
      );
    }
  }

  async resendOtp(email: string) {
    try {
      const user = await this.userRepo.findOneBy({ email });
      if (!user) throw new BadRequestException('User not found');

      const otp = this.generateOtp();

      const otpPayload = {
        otp,
        email: user.email,
        expiresAt: new Date(Date.now() + ms('24 hours')),
      };

      const newOtp = this.otpRepo.create(otpPayload);

      await this.mailerService.sendMail({
        to: user.email,
        subject: 'Resend OTP - SquadBay',
        template: 'verify-email',
        context: {
          otp,
          email: user.email,
          expirationTime: '24 hours',
        },
      });

      await this.otpRepo.save(newOtp);

      return 'OTP resent to your email. Please check your inbox.';
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : 'User not found',
      );
    }
  }

  generateOtp(length: number = 6) {
    const digits = '0123456789';
    let otp = '';
    for (let i = 0; i < length; i++) {
      otp += digits.charAt(Math.floor(Math.random() * digits.length));
    }
    return otp;
  }

  async sendVerificationEmail(user: User) {}
}
