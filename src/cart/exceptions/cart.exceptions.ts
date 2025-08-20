import { BadRequestException, NotFoundException } from '@nestjs/common';

export class CartNotFoundException extends NotFoundException {
  constructor() {
    super('Cart not found');
  }
}

export class CartItemNotFoundException extends NotFoundException {
  constructor() {
    super('Cart item not found');
  }
}

export class ProductNotFoundException extends NotFoundException {
  constructor() {
    super('Product not found or unavailable');
  }
}

export class InsufficientStockException extends BadRequestException {
  constructor(available: number) {
    super(`Insufficient stock. Only ${available} items available`);
  }
}

export class CartItemAlreadyExistsException extends BadRequestException {
  constructor() {
    super('Product already exists in cart. Use update to modify quantity');
  }
}
