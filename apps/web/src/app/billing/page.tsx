'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Check, CreditCard, Crown, Building2 } from 'lucide-react';

interface Plan {
  id: string;
  name: string;
  price: number;
  interval: string;
  features: string[];
}

interface Subscription {
  tier: string;
  plan: Plan;
  status: string | null;
  currentPeriodEnd: string | null;
}

interface Invoice {
  id: string;
  stripeInvoiceId: string;
  amount: number;
  currency: string;
  status: string;
  invoiceDate: string;
  paidAt: string | null;
  description: string | null;
  receiptUrl: string | null;
}

export default function BillingPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isUpgrading, setIsUpgrading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (session) {
      fetchData();
    }
  }, [session]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [plansRes, subRes, invoicesRes] = await Promise.all([
        apiFetch('/stripe/plans'),
        apiFetch('/stripe/subscription'),
        apiFetch('/stripe/invoices'),
      ]);

      const plansData = await plansRes.json();
      const subData = await subRes.json();
      const invoicesData = await invoicesRes.json();

      setPlans(plansData.plans);
      setSubscription(subData);
      setInvoices(invoicesData.invoices || []);
    } catch (err) {
      setError('Failed to load billing data');
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (priceId: string) => {
    setIsUpgrading(priceId);
    try {
      const response = await apiFetch('/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId,
          successUrl: `${window.location.origin}/dashboard?upgrade=success`,
          cancelUrl: `${window.location.origin}/billing?upgrade=cancelled`,
        }),
      });

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      setError('Failed to start upgrade');
      setIsUpgrading(null);
    }
  };

  const handleManageSubscription = async () => {
    try {
      const response = await apiFetch('/stripe/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          returnUrl: window.location.origin + '/billing',
        }),
      });

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      setError('Failed to open billing portal');
    }
  };

  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription?')) return;

    try {
      const response = await apiFetch('/stripe/cancel', { method: 'POST' });
      if (response.ok) {
        fetchData();
      }
    } catch (err) {
      setError('Failed to cancel subscription');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getPlanIcon = (planName: string) => {
    switch (planName) {
      case 'Free':
        return <CreditCard className="h-5 w-5" />;
      case 'Pro':
        return <Crown className="h-5 w-5" />;
      case 'Enterprise':
        return <Building2 className="h-5 w-5" />;
      default:
        return <CreditCard className="h-5 w-5" />;
    }
  };

  const getPlanColor = (planName: string) => {
    switch (planName) {
      case 'Free':
        return 'bg-gray-100 border-gray-300';
      case 'Pro':
        return 'bg-blue-50 border-blue-300';
      case 'Enterprise':
        return 'bg-purple-50 border-purple-300';
      default:
        return 'bg-gray-100 border-gray-300';
    }
  };

  if (!session) {
    redirect('/login');
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Billing & Subscription</h1>
          <p className="mt-1 text-sm text-gray-500">Manage your subscription and billing</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Current Subscription */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Current Subscription</CardTitle>
          </CardHeader>
          <CardContent>
            {subscription?.status === 'active' ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold">{subscription.plan.name}</p>
                    <p className="text-gray-500">
                      {formatCurrency(subscription.plan.price)}/{subscription.plan.interval}
                    </p>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                </div>
                {subscription.currentPeriodEnd && (
                  <p className="text-sm text-gray-500">
                    Renews on {formatDate(subscription.currentPeriodEnd)}
                  </p>
                )}
                <div className="flex gap-2">
                  <Button onClick={handleManageSubscription}>Manage Subscription</Button>
                  <Button variant="outline" onClick={handleCancelSubscription}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-2xl font-bold">{subscription?.plan.name || 'Free'}</p>
                <p className="text-gray-500">You are on the free plan</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Available Plans */}
        <h2 className="text-xl font-bold mb-4">Available Plans</h2>
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {plans.map((plan) => {
            const isCurrentPlan = subscription?.plan.id === plan.id;
            return (
              <Card key={plan.id} className={getPlanColor(plan.name)}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {getPlanIcon(plan.name)}
                    {plan.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold mb-4">
                    {plan.price === 0 ? 'Free' : `${formatCurrency(plan.price)}`}
                    {plan.price > 0 && <span className="text-sm font-normal">/{plan.interval}</span>}
                  </p>
                  <ul className="space-y-2 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full"
                    variant={isCurrentPlan ? 'outline' : 'default'}
                    disabled={isCurrentPlan || isUpgrading === plan.id}
                    onClick={() => handleUpgrade(plan.id)}
                  >
                    {isCurrentPlan ? 'Current Plan' : isUpgrading === plan.id ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : plan.price === 0 ? 'Downgrade' : 'Upgrade'}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Invoice History */}
        {invoices.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Invoice History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Date</th>
                      <th className="text-left py-3 px-4">Description</th>
                      <th className="text-left py-3 px-4">Amount</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-left py-3 px-4">Receipt</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((invoice) => (
                      <tr key={invoice.id} className="border-b">
                        <td className="py-3 px-4">{formatDate(invoice.invoiceDate)}</td>
                        <td className="py-3 px-4">{invoice.description || 'Subscription'}</td>
                        <td className="py-3 px-4">{formatCurrency(invoice.amount)}</td>
                        <td className="py-3 px-4">
                          <Badge
                            className={
                              invoice.status === 'paid'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }
                          >
                            {invoice.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          {invoice.receiptUrl && (
                            <a
                              href={invoice.receiptUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              View
                            </a>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}