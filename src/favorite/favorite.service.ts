import { Injectable } from '@nestjs/common';
import { CreateFavoriteDto } from './dto/create-favorite.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Favorite } from './entities/favorite.entity';
import { Repository } from 'typeorm';

@Injectable()
export class FavoriteService {
  constructor(
    @InjectRepository(Favorite)
    private favoriteRepository: Repository<Favorite>,
  ) {}

  async create(userId: string, createFavoriteDto: CreateFavoriteDto) {
    const favorite = this.favoriteRepository.create({
      ...createFavoriteDto,
      userId,
    });
    return this.favoriteRepository.save(favorite);
  }

  async findAll(userId: string) {
    return this.favoriteRepository.find({
      where: { userId },
      relations: ['product'],
      select: {
        product: {
          id: true,
          name: true,
          price: true,
          description: true,
          images: true,
        },
      },
    });
  }

  async remove(productId: string, userId: string) {
    return this.favoriteRepository.delete({ productId, userId });
  }
}
