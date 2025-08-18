import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { QueryProductDto } from './dto/product-filters.dto';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Request() req, @Body() createProductDto: CreateProductDto) {
    const userId = req.user?.userId;
    return this.productService.create(userId, createProductDto);
  }

  @Get()
  findAll(@Query() query: QueryProductDto) {
    return this.productService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    const userId = req.user?.userId;
    return this.productService.update(userId, id, updateProductDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Request() req, @Param('id') id: string) {
    const userId = req.user?.userId;
    return this.productService.remove(userId, id);
  }
}
