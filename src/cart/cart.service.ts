// import { BadRequestException, Injectable, Logger } from '@nestjs/common';
// import { CreateCartDto } from './dto/create-cart.dto';
// import { UpdateCartDto } from './dto/update-cart.dto';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Cart } from './entities/cart.entity';
// import { Repository } from 'typeorm';
// import { Product } from 'src/product/entities/product.entity';
// import { User } from 'src/user/entities/user/user.entity';
// import { CheckoutDto } from './dto/checkout.dto';
// import { Order } from 'src/order/entities/order.entity';
// import { OrderService } from 'src/order/order.service';

import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { Cart, CartStatus } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { Product } from 'src/product/entities/product.entity';
import { User } from 'src/user/entities/user/user.entity';
import { ProductStatus } from 'src/product/enums';
import {
  CartItemAlreadyExistsException,
  CartItemNotFoundException,
  CartNotFoundException,
  InsufficientStockException,
  ProductNotFoundException,
} from './exceptions/cart.exceptions';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { AddToCartDto } from './dto/create-cart.dto';

// @Injectable()
// export class CartService {
//   private readonly logger = new Logger(CartService.name);

//   constructor(
//     @InjectRepository(Cart)
//     private readonly cartRepository: Repository<Cart>,

//     @InjectRepository(Product)
//     private readonly productRepository: Repository<Product>,

//     @InjectRepository(User)
//     private readonly userRepository: Repository<User>,

//     private readonly orderService: OrderService,
//   ) {}

//   async addToCart(userId: string, createCartDto: CreateCartDto) {
//     const product = await this.productRepository.findOneBy({
//       id: createCartDto.productId,
//     });
//     if (!product) throw new BadRequestException('Product not found');

//     const existingCartItem = await this.cartRepository.findOne({
//       where: { product: { id: product.id }, userId: userId },
//     });

//     if (existingCartItem)
//       throw new BadRequestException('Product already in cart');

//     const user = await this.userRepository.findOneBy({ id: userId });
//     if (!user) throw new BadRequestException('User not found');

//     const cart = this.cartRepository.create({
//       ...createCartDto,
//       user,
//       product,
//     });
//     return this.cartRepository.save(cart);
//   }

//   async findAll(userId: string) {
//     return this.cartRepository.find({
//       where: { userId },
//       relations: {
//         product: {
//           merchant: true,
//         },
//       },
//       select: {
//         product: {
//           id: true,
//           images: true,
//           name: true,
//           price: true,
//           discount: true,
//           merchant: {
//             id: true,
//           },
//         },
//         user: {
//           merchant: {
//             id: true,
//           },
//         },
//       },
//     });
//   }

//   async findOne(userId: string, id: string) {
//     return this.cartRepository.findOne({ where: { id, userId } });
//   }

//   async update(userId: string, id: string, updateCartDto: UpdateCartDto) {
//     return this.cartRepository.update({ id, userId }, updateCartDto);
//   }

//   async remove(userId: string, productId: string) {
//     return this.cartRepository.delete({ product: { id: productId }, userId });
//   }

//   async checkout(userId: string, checkoutDto: CheckoutDto) {
//     try {
//       const user = await this.userRepository.findOneBy({ id: userId });
//       if (!user) throw new BadRequestException('User not found');

//       const cartItems = await this.findAll(userId);

//       let amount = 0;

//       const merchantGroups = cartItems.reduce(
//         (groups, item) => {
//           const merchantId = item.product.merchant.id;
//           if (!groups[merchantId]) groups[merchantId] = [];
//           groups[merchantId].push(item);
//           return groups;
//         },
//         {} as Record<string, Cart[]>,
//       );

//       const orders: Order[] = [];

//       for (const [merchantId, items] of Object.entries(merchantGroups)) {
//         const total = items.reduce(
//           (sum, i) => sum + i.product.price * i.quantity,
//           0,
//         );

//         const order = await this.orderService.create({
//           userId,
//           merchantId,
//           items,
//           total,
//           status: 'PENDING',
//         });

//         orders.push(order);
//       }

//       throw new BadRequestException('Cart is empty');

//       // const payload = {
//       //   amount: amount * 100,
//       //   email: user.email,
//       //   currency: 'NGN',
//       //   initiate_type: 'inline',
//       //   customer_name: user.fullName,
//       //   transaction_ref: `txn_${nanoid(10)}`,
//       //   callback_url:
//       //     this.configService.get<string>('FRONTEND_URL') +
//       //     '/cart?state=success',
//       //   pass_charge: true,
//       //   metadata: {
//       //     userId: user.id,
//       //     plan: checkoutDto.paymentPlan,
//       //     cartItems: cartItems.map((item) => ({
//       //       productId: item.product.id,
//       //       quantity: item.quantity,
//       //     })),
//       //   },
//       // };

//       // const data = await this.squadService.initiateTransaction(payload);

//       // return data;
//     } catch (error) {
//       this.logger.error(
//         'Checkout failed',
//         error?.response?.data || error.message,
//       );
//       throw new BadRequestException('Checkout failed');
//     }
//   }
// }

@Injectable()
export class CartService {
  private readonly logger = new Logger(CartService.name);

  constructor(
    @InjectRepository(Cart)
    private cartRepository: Repository<Cart>,

    @InjectRepository(User)
    private userRepository: Repository<User>,
    private dataSource: DataSource,
  ) {}

  async getOrCreateCart(userId: string): Promise<Cart> {
    try {
      const user = await this.userRepository.findOne({
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      let cart = await this.cartRepository.findOne({
        where: {
          userId,
          status: CartStatus.ACTIVE,
        },
        relations: ['items', 'items.product', 'items.product.merchant'],
      });

      // Create new cart if none exists
      if (!cart) {
        cart = this.cartRepository.create({
          userId,
          status: CartStatus.ACTIVE,
          totalAmount: 0,
        });
        cart = await this.cartRepository.save(cart);

        this.logger.log(`Created new cart for user ${userId}`);
      }

      return cart;
    } catch (error) {
      this.logger.error(
        `Error getting/creating cart for user ${userId}:`,
        error,
      );
      throw error;
    }
  }

  async getUserCart(userId: string) {
    try {
      const cart = await this.getOrCreateCart(userId);

      return this.mapToCartResponse(cart);
    } catch (error) {
      this.logger.error(`Error fetching cart for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Add product to cart
   */
  async addToCart(userId: string, addToCartDto: AddToCartDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { productId, quantity } = addToCartDto;

      const product = await queryRunner.manager.findOne(Product, {
        where: {
          id: productId,
          status: ProductStatus.ACTIVE,
        },
        relations: ['merchant'],
      });

      if (!product) {
        throw new ProductNotFoundException();
      }

      if (product.stockQuantity < quantity) {
        throw new InsufficientStockException(product.stockQuantity);
      }

      const cart = await this.getOrCreateCart(userId);

      const existingCartItem = await queryRunner.manager.findOne(CartItem, {
        where: {
          cartId: cart.id,
          productId,
        },
      });

      if (existingCartItem) {
        throw new CartItemAlreadyExistsException();
      }

      // Calculate prices
      const unitPrice = product.discount
        ? product.price * (1 - product.discount)
        : product.price;
      const totalPrice = unitPrice * quantity;

      // Create cart item
      const cartItem = queryRunner.manager.create(CartItem, {
        cartId: cart.id,
        productId,
        quantity,
        unitPrice,
        totalPrice,
      });

      await queryRunner.manager.save(CartItem, cartItem);

      // Update cart total
      await this.recalculateCartTotal(cart.id, queryRunner.manager);

      await queryRunner.commitTransaction();

      this.logger.log(`Added product ${productId} to cart ${cart.id}`);

      // Return updated cart
      return await this.getUserCart(userId);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`Error adding to cart for user ${userId}:`, error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Update cart item quantity
   */
  async updateCartItem(
    userId: string,
    cartItemId: string,
    updateDto: UpdateCartItemDto,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { quantity } = updateDto;

      const cartItem = await queryRunner.manager.findOne(CartItem, {
        where: { id: cartItemId },
        relations: ['cart', 'product'],
      });

      if (!cartItem || cartItem.cart.userId !== userId) {
        throw new CartItemNotFoundException();
      }

      if (cartItem.product.stockQuantity < quantity) {
        throw new InsufficientStockException(cartItem.product.stockQuantity);
      }

      cartItem.quantity = quantity;
      cartItem.totalPrice = cartItem.unitPrice * quantity;

      await queryRunner.manager.save(CartItem, cartItem);

      await this.recalculateCartTotal(cartItem.cartId, queryRunner.manager);

      await queryRunner.commitTransaction();

      this.logger.log(
        `Updated cart item ${cartItemId} quantity to ${quantity}`,
      );

      return await this.getUserCart(userId);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`Error updating cart item ${cartItemId}:`, error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Remove item from cart
   */
  async removeCartItem(userId: string, cartItemId: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const cartItem = await queryRunner.manager.findOne(CartItem, {
        where: { id: cartItemId },
        relations: ['cart'],
      });

      if (!cartItem || cartItem.cart.userId !== userId) {
        throw new CartItemNotFoundException();
      }

      const cartId = cartItem.cartId;

      await queryRunner.manager.remove(CartItem, cartItem);

      await this.recalculateCartTotal(cartId, queryRunner.manager);

      await queryRunner.commitTransaction();

      this.logger.log(`Removed cart item ${cartItemId} from cart`);

      return await this.getUserCart(userId);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`Error removing cart item ${cartItemId}:`, error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Clear entire cart
   */
  async clearCart(userId: string): Promise<{ message: string }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const cart = await queryRunner.manager.findOne(Cart, {
        where: {
          userId,
          status: CartStatus.ACTIVE,
        },
      });

      if (!cart) {
        throw new CartNotFoundException();
      }

      await queryRunner.manager.delete(CartItem, { cartId: cart.id });

      cart.totalAmount = 0;
      await queryRunner.manager.save(Cart, cart);

      await queryRunner.commitTransaction();

      this.logger.log(`Cleared cart ${cart.id} for user ${userId}`);

      return { message: 'Cart cleared successfully' };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`Error clearing cart for user ${userId}:`, error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Get cart items count
   */
  async getCartItemsCount(userId: string): Promise<{ count: number }> {
    try {
      const cart = await this.cartRepository.findOne({
        where: {
          userId,
          status: CartStatus.ACTIVE,
        },
        relations: ['items'],
      });

      const count =
        cart?.items?.reduce((total, item) => total + item.quantity, 0) || 0;

      return { count };
    } catch (error) {
      this.logger.error(
        `Error getting cart items count for user ${userId}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Validate cart for checkout
   */
  async validateCartForCheckout(userId: string) {
    try {
      const cart = await this.getOrCreateCart(userId);
      const errors: string[] = [];

      if (!cart.items || cart.items.length === 0) {
        errors.push('Cart is empty');
        return { valid: false, errors };
      }

      // Validate each item
      for (const item of cart.items) {
        // Check product availability
        if (item.product.status !== ProductStatus.ACTIVE) {
          errors.push(`Product "${item.product.name}" is no longer available`);
          continue;
        }

        // Check stock
        if (item.product.stockQuantity < item.quantity) {
          errors.push(
            `Insufficient stock for "${item.product.name}". Only ${item.product.stockQuantity} available`,
          );
        }

        // Validate merchant is active
        if (item.product.merchant.status !== 'active') {
          errors.push(
            `Merchant for "${item.product.name}" is currently unavailable`,
          );
        }
      }

      const cartResponse = this.mapToCartResponse(cart);

      return {
        valid: errors.length === 0,
        errors,
        cart: cartResponse,
      };
    } catch (error) {
      this.logger.error(`Error validating cart for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Mark cart as converted (after successful checkout)
   */
  async markCartAsConverted(userId: string): Promise<void> {
    try {
      await this.cartRepository.update(
        {
          userId,
          status: CartStatus.ACTIVE,
        },
        {
          status: CartStatus.CONVERTED,
        },
      );

      this.logger.log(`Marked cart as converted for user ${userId}`);
    } catch (error) {
      this.logger.error(
        `Error marking cart as converted for user ${userId}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Recalculate cart total amount
   */
  private async recalculateCartTotal(cartId: string, manager: EntityManager) {
    const cartItems = await manager.find(CartItem, {
      where: { cartId },
    });

    const totalAmount = cartItems.reduce(
      (sum, item) => sum + item.totalPrice,
      0,
    );

    await manager.update(Cart, cartId, { totalAmount });
  }

  /**
   * Map cart entity to response DTO
   */
  private mapToCartResponse(cart: Cart) {
    return {
      id: cart.id,
      status: cart.status,
      totalAmount: cart.totalAmount,
      totalItems:
        cart.items?.reduce((total, item) => total + item.quantity, 0) || 0,
      items:
        cart.items?.map((item) => ({
          id: item.id,
          productId: item.productId,
          productName: item.product.name,
          productImage: item.product.images || '',
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
          stockAvailable: item.product.stockQuantity,
          bnplEligible: item.product.bnplEligible,
          maxInstallments: item.product.maxInstallments,
        })) || [],
      createdAt: cart.createdAt,
      updatedAt: cart.updatedAt,
    };
  }
}
