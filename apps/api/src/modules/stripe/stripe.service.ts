import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@finance-app/db';

const prisma = new PrismaClient();

export interface CreateCheckoutSessionParams {
  userId: string;
  priceId: string;
  successUrl: string;
  cancelUrl: string;
}

export interface CreatePortalSessionParams {
  userId: string;
  returnUrl: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  interval: 'month' | 'year';
  features: string[];
}

@Injectable()
export class StripeService {
  // Define available subscription plans
  private readonly plans: SubscriptionPlan[] = [
    {
      id: 'price_free',
      name: 'Free',
      price: 0,
      interval: 'month',
      features: [
        'Basic transaction tracking',
        'Up to 50 transactions/month',
        'Basic categories',
        'Monthly budget tracking',
      ],
    },
    {
      id: 'price_pro_monthly',
      name: 'Pro',
      price: 9.99,
      interval: 'month',
      features: [
        'Unlimited transactions',
        'Advanced categories',
        'AI Financial Advisor',
        'Receipt OCR scanning',
        'Financial memory & insights',
        'Priority support',
      ],
    },
    {
      id: 'price_enterprise_monthly',
      name: 'Enterprise',
      price: 29.99,
      interval: 'month',
      features: [
        'Everything in Pro',
        'Unlimited budgets',
        'Export data (CSV/PDF)',
        'API access',
        'Custom integrations',
        'Dedicated support',
      ],
    },
  ];

  async getPlans(): Promise<SubscriptionPlan[]> {
    return this.plans;
  }

  async getUserSubscription(userId: string) {
    const customer = await prisma.stripeCustomer.findUnique({
      where: { userId },
      include: { user: true },
    });

    if (!customer) {
      return {
        tier: 'free',
        plan: this.plans[0],
        status: null,
        currentPeriodEnd: null,
      };
    }

    const plan = this.plans.find((p) => p.id === customer.planId) || this.plans[0];

    return {
      tier: customer.subscriptionStatus === 'active' ? plan.id : 'free',
      plan,
      status: customer.subscriptionStatus,
      currentPeriodEnd: customer.currentPeriodEnd,
    };
  }

  async createCheckoutSession(params: CreateCheckoutSessionParams) {
    const { userId, priceId, successUrl, cancelUrl } = params;

    // Get or create Stripe customer
    let customer = await prisma.stripeCustomer.findUnique({
      where: { userId },
    });

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // For now, return a mock checkout session URL
    // In production, this would use the actual Stripe SDK
    const checkoutSessionId = `cs_${Date.now()}_${userId}`;
    const checkoutUrl = `${successUrl}?session_id=${checkoutSessionId}`;

    // Store pending checkout
    await prisma.stripeCustomer.upsert({
      where: { userId },
      create: {
        userId,
        stripeCustomerId: `cus_${Date.now()}`,
        planId: priceId,
        subscriptionStatus: 'pending',
      },
      update: {
        planId: priceId,
        subscriptionStatus: 'pending',
      },
    });

    return {
      sessionId: checkoutSessionId,
      url: checkoutUrl,
    };
  }

  async createPortalSession(params: CreatePortalSessionParams) {
    const { userId, returnUrl } = params;

    const customer = await prisma.stripeCustomer.findUnique({
      where: { userId },
    });

    if (!customer) {
      throw new Error('No subscription found');
    }

    // Mock portal session
    const portalSessionId = `bps_${Date.now()}_${userId}`;
    const portalUrl = `${returnUrl}?session=${portalSessionId}`;

    return {
      sessionId: portalSessionId,
      url: portalUrl,
    };
  }

  async handleWebhook(event: any) {
    const { type, data } = event;

    switch (type) {
      case 'checkout.session.completed': {
        const session = data.object;
        const userId = session.metadata?.userId;

        if (userId) {
          await prisma.stripeCustomer.update({
            where: { userId },
            data: {
              subscriptionId: session.subscription,
              subscriptionStatus: 'active',
              planId: session.metadata?.priceId,
              currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
            },
          });

          await prisma.user.update({
            where: { id: userId },
            data: { subscriptionTier: 'pro' },
          });
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = data.object;
        const customerId = subscription.customer;

        const customer = await prisma.stripeCustomer.findFirst({
          where: { stripeCustomerId: customerId },
        });

        if (customer) {
          const status = subscription.status;
          const tier = status === 'active' ? 'pro' : 'free';

          await prisma.stripeCustomer.update({
            where: { id: customer.id },
            data: {
              subscriptionStatus: status,
              currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            },
          });

          await prisma.user.update({
            where: { id: customer.userId },
            data: { subscriptionTier: tier },
          });
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = data.object;
        const customerId = subscription.customer;

        const customer = await prisma.stripeCustomer.findFirst({
          where: { stripeCustomerId: customerId },
        });

        if (customer) {
          await prisma.stripeCustomer.update({
            where: { id: customer.id },
            data: {
              subscriptionStatus: 'canceled',
              subscriptionId: null,
              planId: 'price_free',
            },
          });

          await prisma.user.update({
            where: { id: customer.userId },
            data: { subscriptionTier: 'free' },
          });
        }
        break;
      }

      case 'invoice.paid': {
        const invoice = data.object;
        const customerId = invoice.customer;

        const customer = await prisma.stripeCustomer.findFirst({
          where: { stripeCustomerId: customerId },
        });

        if (customer) {
          await prisma.invoice.create({
            data: {
              userId: customer.userId,
              stripeInvoiceId: invoice.id,
              amount: invoice.amount_paid / 100,
              currency: invoice.currency,
              status: 'paid',
              invoiceDate: new Date(invoice.created * 1000),
              paidAt: new Date(),
              description: invoice.description,
              receiptUrl: invoice.hosted_invoice_url,
            },
          });
        }
        break;
      }

      default:
        console.log(`Unhandled webhook event type: ${type}`);
    }

    return { received: true };
  }

  async cancelSubscription(userId: string) {
    const customer = await prisma.stripeCustomer.findUnique({
      where: { userId },
    });

    if (!customer || !customer.subscriptionId) {
      throw new Error('No active subscription found');
    }

    // In production, this would call Stripe API to cancel
    await prisma.stripeCustomer.update({
      where: { userId },
      data: {
        subscriptionStatus: 'canceled',
      },
    });

    await prisma.user.update({
      where: { id: userId },
      data: { subscriptionTier: 'free' },
    });

    return { success: true, message: 'Subscription canceled' };
  }

  async getInvoices(userId: string) {
    return prisma.invoice.findMany({
      where: { userId },
      orderBy: { invoiceDate: 'desc' },
    });
  }

  // Feature gating based on subscription tier
  async checkFeatureAccess(userId: string, feature: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) return false;

    const tier = user.subscriptionTier;

    // Feature access map
    const featureAccess: Record<string, string[]> = {
      free: [
        'basic_transactions',
        'basic_categories',
        'basic_budgets',
      ],
      pro: [
        'basic_transactions',
        'basic_categories',
        'basic_budgets',
        'unlimited_transactions',
        'ai_advisor',
        'receipt_ocr',
        'financial_memory',
      ],
      enterprise: [
        'basic_transactions',
        'basic_categories',
        'basic_budgets',
        'unlimited_transactions',
        'ai_advisor',
        'receipt_ocr',
        'financial_memory',
        'export_data',
        'api_access',
        'custom_integrations',
      ],
    };

    return featureAccess[tier]?.includes(feature) || false;
  }
}