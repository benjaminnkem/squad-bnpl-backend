import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user/user.entity';
import { UpdateUserDto } from 'src/user/dto/user/update-user.dto';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async updateUserInfo(userId: string, updateUserDto: UpdateUserDto) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });
    if (!user) throw new Error('User not found');

    Object.assign(user, updateUserDto);
    return await this.userRepository.save(user);
  }

  async getUserInfo(userId: string) {
    return await this.userRepository.findOne({
      where: { id: userId },
      relations: ['merchant'],
      select: {
        merchant: {
          id: true,
          businessName: true,
          status: true,
        },
      },
    });
  }

  findOne(id: string) {
    return `This action returns a #${id} user`;
  }
}
