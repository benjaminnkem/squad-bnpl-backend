import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, QueryRunner, Repository } from 'typeorm';
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
import { CheckoutDto, CheckoutType } from './dto/checkout.dto';
import { ConfigService } from '@nestjs/config';
import { SquadService } from 'src/payment/services/squad.service';
import { PaymentInitResponse } from 'src/_lib/types/api.types';
import { InstallmentPlan } from 'src/installment-plan/entities/installment-plan.entity';
import { Order } from 'src/order/entities/order.entity';
import { nanoid } from 'nanoid';
import { OrderStatus, PaymentType } from 'src/order/enums';
import { OrderItem } from 'src/order/entities/order-item.entity';
import { Payment } from 'src/payment/entities/payment.entity';
import {
  Currency,
  InitiateType,
  PaymentMethod,
  PaymentPurpose,
  PaymentStatus,
} from 'src/payment/enums';
import { InitiateTransactionDto } from 'src/payment/dto/squad.dto';
import { InstallmentPlanStatus } from 'src/installment-plan/enums';
import { Installment } from 'src/installment/entities/installment.entity';
import { InstallmentStatus } from 'src/installment/enums';

@Injectable()
export class CartService {
  private readonly logger = new Logger(CartService.name);

  constructor(
    @InjectRepository(Cart)
    private cartRepository: Repository<Cart>,

    @InjectRepository(User)
    private userRepository: Repository<User>,

    private dataSource: DataSource,
    private readonly configService: ConfigService,
    private readonly squadProvider: SquadService,
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

      const unitPrice = product.discount
        ? product.price - product.price * (product.discount / 100)
        : product.price;
      const totalPrice = unitPrice * quantity;

      const cartItem = queryRunner.manager.create(CartItem, {
        cartId: cart.id,
        productId,
        quantity,
        unitPrice,
        totalPrice,
      });

      await queryRunner.manager.save(CartItem, cartItem);

      await this.recalculateCartTotal(cart.id, queryRunner.manager);

      await queryRunner.commitTransaction();

      this.logger.log(`Added product ${productId} to cart ${cart.id}`);

      return await this.getUserCart(userId);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`Error adding to cart for user ${userId}:`, error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

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
          merchantId: item.product.merchantId,
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

  async checkout(userId: string, checkoutDto: CheckoutDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      this.logger.log(
        `Starting checkout for user ${userId}, type: ${checkoutDto.checkoutType}`,
      );

      // Validate cart
      const { valid, errors, cart } =
        await this.validateCartForCheckout(userId);
      if (!valid || !cart) {
        throw new BadRequestException(
          `Cart validation failed: ${errors.join(', ')}`,
        );
      }

      // GET USER
      const user = await queryRunner.manager.findOne(User, {
        where: { id: userId },
      });
      if (!user) throw new NotFoundException('User not found');

      // Validate BNPL specific requirements
      if (checkoutDto.checkoutType === CheckoutType.BNPL) {
        await this.validateBnplCheckout(user, cart, checkoutDto, queryRunner);
      }

      // Calculate checkout amounts
      const checkoutCalculation = await this.calculateCheckoutAmounts(
        cart,
        checkoutDto,
        queryRunner,
      );

      // Create order
      const order = await this.createOrder(
        user,
        cart,
        checkoutDto,
        checkoutCalculation,
        queryRunner,
      );

      // Create order items and update inventory
      await this.createOrderItems(order.id, cart, queryRunner);

      // Handle payment based on checkout type
      let paymentResponse: PaymentInitResponse;
      let installmentPlan: InstallmentPlan | null = null;

      if (checkoutDto.checkoutType === CheckoutType.FULL_PAYMENT) {
        paymentResponse = await this.initiateFullPayment(
          order,
          user,
          queryRunner,
        );
      } else {
        const result = await this.initiateBnplPayment(
          order,
          user,
          checkoutDto,
          checkoutCalculation,
          queryRunner,
        );
        paymentResponse = result.paymentResponse;
        installmentPlan = result.installmentPlan;
      }

      // Update user's BNPL limit if applicable
      if (checkoutDto.checkoutType === CheckoutType.BNPL) {
        await this.updateUserBnplLimit(
          user,
          checkoutCalculation.totalAmount,
          queryRunner,
        );
      }

      // Mark cart as converted
      await this.markCartAsConverted(userId);

      await queryRunner.commitTransaction();

      this.logger.log(
        `Checkout completed successfully for order ${order.orderNumber}`,
      );

      // Return response
      return {
        orderId: order.id,
        orderNumber: order.orderNumber,
        checkoutType: checkoutDto.checkoutType,
        totalAmount: checkoutCalculation.totalAmount,
        amountToPay: checkoutCalculation.amountToPay,
        paymentUrl: paymentResponse.checkout_url,
        installmentPlan: installmentPlan
          ? {
              totalInstallments: installmentPlan.totalInstallments,
              installmentAmount: installmentPlan.installmentAmount,
              firstPaymentAmount:
                checkoutCalculation.firstInstallmentAmount ||
                checkoutCalculation.amountToPay,
              nextDueDate: installmentPlan.nextDueDate?.toISOString(),
            }
          : undefined,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`Checkout failed for user ${userId}:`, error?.message);
      throw new InternalServerErrorException(
        error?.message || 'Checkout failed',
      );
    } finally {
      await queryRunner.release();
    }
  }

  private async validateBnplCheckout(
    user: User,
    cart: any,
    checkoutDto: CheckoutDto,
    queryRunner: any,
  ): Promise<void> {
    // Check if installments is provided
    if (!checkoutDto.installments) {
      throw new BadRequestException('Installments required for BNPL checkout');
    }

    // Check user BNPL eligibility
    if (user.status !== 'active') {
      throw new BadRequestException('User account not eligible for BNPL');
    }

    // Check available BNPL limit
    if (user.availableLimit < cart.totalAmount) {
      throw new BadRequestException(
        `Insufficient BNPL limit. Available: ₦${user.availableLimit}, Required: ₦${cart.totalAmount}`,
      );
    }

    // Validate BNPL eligible items
    const bnplEligibleAmount = cart.items
      .filter((item) => item.bnplEligible)
      .reduce((sum, item) => sum + item.totalPrice, 0);

    if (bnplEligibleAmount === 0) {
      throw new BadRequestException('No BNPL eligible items in cart');
    }

    // Check minimum BNPL amount (e.g., ₦10,000)
    const minBnplAmount = 10000;
    if (bnplEligibleAmount < minBnplAmount) {
      throw new BadRequestException(`Minimum BNPL amount is ₦${minBnplAmount}`);
    }
  }

  private async calculateCheckoutAmounts(
    cart: any,
    checkoutDto: CheckoutDto,
    queryRunner: QueryRunner,
  ) {
    const totalAmount = cart.totalAmount;

    // TODO: Calculate shipping fee
    const shippingFee = await this.calculateShippingFee(cart, checkoutDto);

    // Calculate service fee for merchants (3-5%)
    const serviceFee = totalAmount * 0.035; // 3.5% average

    const finalAmount = totalAmount + shippingFee;

    let amountToPay = finalAmount;
    let firstInstallmentAmount: number | undefined;

    if (checkoutDto.checkoutType === CheckoutType.BNPL) {
      // For BNPL, calculate first installment (could be higher than regular installments)
      const installmentAmount = finalAmount / checkoutDto.installments!;

      // First installment might be higher to reduce risk (e.g., 40% upfront for 3 installments)
      const firstInstallmentMultiplier = this.getFirstInstallmentMultiplier(
        checkoutDto.installments!,
      );
      firstInstallmentAmount = Math.ceil(
        finalAmount * firstInstallmentMultiplier,
      );

      amountToPay = firstInstallmentAmount;
    }

    return {
      totalAmount,
      shippingFee,
      serviceFee,
      finalAmount,
      amountToPay,
      firstInstallmentAmount,
    };
  }

  private async createOrder(
    user: User,
    cart: any,
    checkoutDto: CheckoutDto,
    calculation: any,
    queryRunner: any,
  ): Promise<Order> {
    const orderNumber = `SPY-${Date.now()}-${nanoid(6).toUpperCase()}`;

    const order = queryRunner.manager.create(Order, {
      orderNumber,
      userId: user.id,
      merchantId: cart.items[0].merchantId, // Assuming single merchant for now
      status: OrderStatus.PENDING,
      paymentType:
        checkoutDto.checkoutType === CheckoutType.FULL_PAYMENT
          ? PaymentType.FULL_PAYMENT
          : PaymentType.BNPL,
      totalAmount: calculation.totalAmount,
      shippingFee: calculation.shippingFee,
      serviceFee: calculation.serviceFee,
      finalAmount: calculation.finalAmount,
      shippingAddress: checkoutDto.shippingAddress,
      shippingCity: checkoutDto.shippingCity,
      shippingState: checkoutDto.shippingState,
      shippingPhone: checkoutDto.shippingPhone,
      notes: checkoutDto.notes,
    });

    return await queryRunner.manager.save(Order, order);
  }

  private async createOrderItems(
    orderId: string,
    cart: any,
    queryRunner: any,
  ): Promise<void> {
    for (const cartItem of cart.items) {
      // Create order item
      const orderItem = queryRunner.manager.create(OrderItem, {
        orderId,
        productId: cartItem.productId,
        quantity: cartItem.quantity,
        unitPrice: cartItem.unitPrice,
        totalPrice: cartItem.totalPrice,
      });

      await queryRunner.manager.save(OrderItem, orderItem);

      // Update product stock
      await queryRunner.manager.decrement(
        Product,
        { id: cartItem.productId },
        'stockQuantity',
        cartItem.quantity,
      );
    }
  }

  private async initiateFullPayment(
    order: Order,
    user: User,
    queryRunner: any,
  ) {
    const paymentReference = `pay_${nanoid()}`;

    // Create payment record
    const payment = queryRunner.manager.create(Payment, {
      reference: paymentReference,
      userId: user.id,
      orderId: order.id,
      amount: order.finalAmount,
      status: PaymentStatus.PENDING,
      paymentMethod: PaymentMethod.CARD,
      purpose: PaymentPurpose.ORDER_PAYMENT,
    });

    await queryRunner.manager.save(Payment, payment);

    // Initiate Squad payment
    const callback_url = `${this.configService.get<string>('FRONTEND_URL')}/payment/callback`;

    const payload: InitiateTransactionDto = {
      callback_url,
      amount: parseInt(`${order.finalAmount}`) * 100,
      email: user.email,
      currency: Currency.NGN,
      initiate_type: InitiateType.INLINE,
      customer_name: `${user.firstName} ${user.lastName}`,
      transaction_ref: paymentReference,
      pass_charge: true,
      metadata: {
        orderId: order.id,
        userId: user.id,
        paymentType: 'full_payment',
      },
    };

    return await this.squadProvider.initiateTransaction(payload);
  }

  private async initiateBnplPayment(
    order: Order,
    user: User,
    checkoutDto: CheckoutDto,
    calculation: any,
    queryRunner: any,
  ): Promise<{
    paymentResponse: PaymentInitResponse;
    installmentPlan: InstallmentPlan;
  }> {
    // Create installment plan
    const installmentPlan = await this.createInstallmentPlan(
      order,
      checkoutDto,
      calculation,
      queryRunner,
    );

    // Create first installment payment
    const firstPaymentReference = `bnpl_${nanoid()}`;

    const firstPayment = queryRunner.manager.create(Payment, {
      reference: firstPaymentReference,
      userId: user.id,
      orderId: order.id,
      amount: calculation.amountToPay,
      status: PaymentStatus.PENDING,
      paymentMethod: PaymentMethod.CARD,
      purpose: PaymentPurpose.INSTALLMENT_PAYMENT,
    });

    await queryRunner.manager.save(Payment, firstPayment);

    // Initiate Squad payment for first installment
    const callback_url = `${this.configService.get<string>('FRONTEND_URL')}/payment/bnpl-callback`;

    const payload: InitiateTransactionDto = {
      callback_url,
      amount: calculation.amountToPay,
      email: user.email,
      currency: Currency.NGN,
      initiate_type: InitiateType.INLINE,
      customer_name: `${user.firstName} ${user.lastName}`,
      transaction_ref: firstPaymentReference,
      pass_charge: true,
      metadata: {
        orderId: order.id,
        userId: user.id,
        paymentType: 'bnpl_first_installment',
        installmentPlanId: installmentPlan.id,
      },
    };

    const paymentResponse =
      await this.squadProvider.initiateTransaction(payload);

    return { paymentResponse, installmentPlan };
  }

  private async createInstallmentPlan(
    order: Order,
    checkoutDto: CheckoutDto,
    calculation: any,
    queryRunner: any,
  ): Promise<InstallmentPlan> {
    const totalInstallments = checkoutDto.installments!;
    const installmentAmount = Math.ceil(
      (calculation.finalAmount - calculation.firstInstallmentAmount!) /
        (totalInstallments - 1),
    );

    // Next due date is 30 days from now
    const nextDueDate = new Date();
    nextDueDate.setDate(nextDueDate.getDate() + 30);

    const installmentPlan = queryRunner.manager.create(InstallmentPlan, {
      orderId: order.id,
      status: InstallmentPlanStatus.ACTIVE,
      totalInstallments,
      installmentAmount,
      totalAmount: calculation.finalAmount,
      remainingAmount:
        calculation.finalAmount - calculation.firstInstallmentAmount!,
      nextDueDate,
    });

    const savedPlan = await queryRunner.manager.save(
      InstallmentPlan,
      installmentPlan,
    );

    // Create individual installments
    await this.createInstallments(savedPlan, calculation, queryRunner);

    return savedPlan;
  }

  private async createInstallments(
    installmentPlan: InstallmentPlan,
    calculation: any,
    queryRunner: any,
  ): Promise<void> {
    const installments: Installment[] = [];

    for (let i = 1; i <= installmentPlan.totalInstallments; i++) {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + i * 30); // 30 days apart

      const amount =
        i === 1
          ? calculation.firstInstallmentAmount!
          : installmentPlan.installmentAmount;

      const installment = await queryRunner.manager.create(Installment, {
        installmentPlanId: installmentPlan.id,
        installmentNumber: i,
        amount,
        dueDate,
        status: i === 1 ? InstallmentStatus.PENDING : InstallmentStatus.PENDING,
      });

      installments.push(installment as Installment);
    }

    await queryRunner.manager.save(Installment, installments);
  }

  private async updateUserBnplLimit(
    user: User,
    amount: number,
    queryRunner: any,
  ): Promise<void> {
    await queryRunner.manager.update(User, user.id, {
      usedLimit: user.usedLimit + amount,
      availableLimit: user.availableLimit - amount,
    });
  }

  private async calculateShippingFee(
    cart: any,
    checkoutDto: CheckoutDto,
  ): Promise<number> {
    // TODO: Implement your shipping calculation logic
    const baseShippingFee = 2000;

    // location-based adjustments
    const stateMultipliers = {
      Lagos: 1.0,
      Abuja: 1.2,
      'Port Harcourt': 1.3,
    };

    const multiplier = stateMultipliers[checkoutDto.shippingState] || 1.5;
    return Math.ceil(baseShippingFee * multiplier);
  }

  private getFirstInstallmentMultiplier(installments: number): number {
    // Higher first payment reduces risk
    const multipliers = {
      2: 0.6, // 60% upfront for 2 installments
      3: 0.4, // 40% upfront for 3 installments
      6: 0.3, // 30% upfront for 6 installments
      12: 0.25, // 25% upfront for 12 installments
    };

    return multipliers[installments] || 0.5;
  }

  // Payment webhook handler
  async handlePaymentWebhook(webhookData: any): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { transaction_ref, transaction_status, amount } = webhookData;

      // Find payment
      const payment = await queryRunner.manager.findOne(Payment, {
        where: { reference: transaction_ref },
        relations: ['order', 'order.installmentPlan'],
      });

      if (!payment) {
        throw new NotFoundException('Payment not found');
      }

      // Update payment status
      const paymentStatus =
        transaction_status === 'success'
          ? PaymentStatus.SUCCESSFUL
          : PaymentStatus.FAILED;

      await queryRunner.manager.update(Payment, payment.id, {
        status: paymentStatus,
        gatewayReference: webhookData.gateway_ref,
        gatewayResponse: JSON.stringify(webhookData),
        paidAt: paymentStatus === PaymentStatus.SUCCESSFUL ? new Date() : null,
      });

      if (paymentStatus === PaymentStatus.SUCCESSFUL) {
        await this.handleSuccessfulPayment(payment, queryRunner);
      } else {
        await this.handleFailedPayment(payment, queryRunner);
      }

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error('Payment webhook handling failed:', error?.message);
      throw new BadRequestException(
        error?.message || 'Payment processing failed',
      );
    } finally {
      await queryRunner.release();
    }
  }

  private async handleSuccessfulPayment(
    payment: Payment,
    queryRunner: any,
  ): Promise<void> {
    if (payment.purpose === PaymentPurpose.ORDER_PAYMENT) {
      // Full payment - mark order as confirmed
      await queryRunner.manager.update(Order, payment.orderId, {
        status: OrderStatus.CONFIRMED,
      });
    } else if (payment.purpose === PaymentPurpose.INSTALLMENT_PAYMENT) {
      // BNPL payment - update installment and plan
      const installmentPlan = payment.order.installmentPlan;

      if (installmentPlan) {
        const updatedPaidInstallments = installmentPlan.paidInstallments + 1;
        const updatedTotalPaid = installmentPlan.totalPaid + payment.amount;
        const updatedRemainingAmount =
          installmentPlan.remainingAmount - payment.amount;

        await queryRunner.manager.update(InstallmentPlan, installmentPlan.id, {
          paidInstallments: updatedPaidInstallments,
          totalPaid: updatedTotalPaid,
          remainingAmount: updatedRemainingAmount,
          status:
            updatedRemainingAmount <= 0
              ? InstallmentPlanStatus.COMPLETED
              : InstallmentPlanStatus.ACTIVE,
        });

        // Update the specific installment
        await queryRunner.manager.update(
          Installment,
          {
            installmentPlanId: installmentPlan.id,
            installmentNumber: updatedPaidInstallments,
          },
          {
            status: InstallmentStatus.PAID,
            paidAmount: payment.amount,
            paidDate: new Date(),
          },
        );

        // If first installment, confirm order
        if (updatedPaidInstallments === 1) {
          await queryRunner.manager.update(Order, payment.orderId, {
            status: OrderStatus.CONFIRMED,
          });
        }
      }
    }
  }

  private async handleFailedPayment(payment: Payment, queryRunner: any) {
    // Handle failed payment
    if (payment.purpose === PaymentPurpose.ORDER_PAYMENT) {
      // For full payment failure, order remains pending
      this.logger.warn(`Full payment failed for order ${payment.orderId}`);
    } else if (payment.purpose === PaymentPurpose.INSTALLMENT_PAYMENT) {
      // For BNPL, might need to handle differently
      this.logger.warn(
        `BNPL installment payment failed for order ${payment.orderId}`,
      );
    }
  }
}
