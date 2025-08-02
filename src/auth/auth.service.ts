import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from './dto/create-user.dto';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @InjectRepository(User)
    private userRepo: Repository<User>,
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

    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
      },
    };
  }

  async sendVerificationEmail(user: User) {}
}
