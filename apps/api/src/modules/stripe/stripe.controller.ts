import { Controller, Get, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { StripeService } from './stripe.service';

interface AuthRequest {
  user: {
    id: string;
    email: string;
  };
}

@Controller('stripe')
@UseGuards(AuthGuard('jwt'))
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}

  @Get('plans')
  async getPlans() {
    const plans = await this.stripeService.getPlans();
    return { plans };
  }

  @Get('subscription')
  async getSubscription(@Req() req: AuthRequest) {
    const subscription = await this.stripeService.getUserSubscription(req.user.id);
    return subscription;
  }

  @Post('checkout')
  async createCheckoutSession(
    @Req() req: AuthRequest,
    @Body() body: { priceId: string; successUrl: string; cancelUrl: string },
  ) {
    const session = await this.stripeService.createCheckoutSession({
      userId: req.user.id,
      priceId: body.priceId,
      successUrl: body.successUrl,
      cancelUrl: body.cancelUrl,
    });
    return session;
  }

  @Post('portal')
  async createPortalSession(
    @Req() req: AuthRequest,
    @Body() body: { returnUrl: string },
  ) {
    const session = await this.stripeService.createPortalSession({
      userId: req.user.id,
      returnUrl: body.returnUrl,
    });
    return session;
  }

  @Post('cancel')
  async cancelSubscription(@Req() req: AuthRequest) {
    const result = await this.stripeService.cancelSubscription(req.user.id);
    return result;
  }

  @Get('invoices')
  async getInvoices(@Req() req: AuthRequest) {
    const invoices = await this.stripeService.getInvoices(req.user.id);
    return { invoices };
  }

  @Get('features/:feature')
  async checkFeatureAccess(@Req() req: AuthRequest, @Param('feature') feature: string) {
    const hasAccess = await this.stripeService.checkFeatureAccess(req.user.id, feature);
    return { feature, hasAccess };
  }

  @Post('webhook')
  async handleWebhook(@Body() event: any) {
    return this.stripeService.handleWebhook(event);
  }
}