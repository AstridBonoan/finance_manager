'use client';

import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, MessageCircle, Lightbulb, Send } from 'lucide-react';

interface Insight {
  type: string;
  message: string;
}

interface AdvisorContext {
  monthlyIncome: number;
  monthlyExpenses: number;
  balance: number;
  savingsRate: number;
  topExpenseCategories: Array<{ category: string; amount: number }>;
}

interface InsightsData {
  summary: {
    monthlyIncome: number;
    monthlyExpenses: number;
    balance: number;
    savingsRate: number;
  };
  insights: Insight[];
  topExpenseCategories: Array<{ category: string; amount: number }>;
}

interface ChatResponse {
  reply: string;
  context: AdvisorContext;
  model: string;
}

export function AdvisorPanel({ userId }: { userId: string }) {
  const [insights, setInsights] = useState<InsightsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    fetchInsights();
  }, [userId]);

  const fetchInsights = async () => {
    try {
      setLoading(true);
      const response = await apiFetch('/advisor/insights');
      if (!response.ok) {
        throw new Error('Failed to fetch advisor insights');
      }
      const result = await response.json();
      setInsights(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;

    const userMessage = chatInput.trim();
    setChatInput('');
    setChatHistory((prev) => [...prev, { role: 'user', content: userMessage }]);
    setIsChatLoading(true);

    try {
      const response = await apiFetch('/advisor/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const result: ChatResponse = await response.json();
      setChatHistory((prev) => [...prev, { role: 'assistant', content: result.reply }]);
    } catch (err) {
      setChatHistory((prev) => [
        ...prev,
        { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' },
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <span className="ml-2 text-gray-500">Loading financial insights...</span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-red-500 text-center">{error}</p>
          <Button onClick={fetchInsights} className="mt-4 mx-auto block">
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Insights Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xl flex items-center">
            <Lightbulb className="h-5 w-5 mr-2 text-yellow-500" />
            Financial Insights
          </CardTitle>
          <Button variant="outline" size="sm" onClick={() => setShowChat(!showChat)}>
            <MessageCircle className="h-4 w-4 mr-2" />
            {showChat ? 'Hide Chat' : 'Ask Advisor'}
          </Button>
        </CardHeader>
        <CardContent>
          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm text-green-600 font-medium">Monthly Income</p>
              <p className="text-2xl font-bold text-green-700">
                {formatCurrency(insights?.summary.monthlyIncome || 0)}
              </p>
            </div>
            <div className="bg-red-50 rounded-lg p-4">
              <p className="text-sm text-red-600 font-medium">Monthly Expenses</p>
              <p className="text-2xl font-bold text-red-700">
                {formatCurrency(insights?.summary.monthlyExpenses || 0)}
              </p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-blue-600 font-medium">Balance</p>
              <p className="text-2xl font-bold text-blue-700">
                {formatCurrency(insights?.summary.balance || 0)}
              </p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <p className="text-sm text-purple-600 font-medium">Savings Rate</p>
              <p className="text-2xl font-bold text-purple-700">
                {(insights?.summary.savingsRate || 0).toFixed(1)}%
              </p>
            </div>
          </div>

          {/* Insights List */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Recommendations</h4>
            {insights?.insights.map((insight, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg ${
                  insight.type === 'budget_health'
                    ? 'bg-green-50 border-l-4 border-green-500'
                    : 'bg-yellow-50 border-l-4 border-yellow-500'
                }`}
              >
                <p className="text-gray-700">{insight.message}</p>
              </div>
            ))}
          </div>

          {/* Top Expense Categories */}
          {insights?.topExpenseCategories && insights.topExpenseCategories.length > 0 && (
            <div className="mt-6">
              <h4 className="font-medium text-gray-900 mb-3">Top Expense Categories</h4>
              <div className="space-y-2">
                {insights.topExpenseCategories.map((cat, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-gray-600">{cat.category}</span>
                    <span className="font-medium text-gray-900">{formatCurrency(cat.amount)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Chat Interface */}
      {showChat && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">AI Financial Advisor</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 overflow-y-auto space-y-4 mb-4 p-4 bg-gray-50 rounded-lg">
              {chatHistory.length === 0 ? (
                <p className="text-gray-500 text-center">
                  Ask me anything about your finances!
                </p>
              ) : (
                chatHistory.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-lg ${
                        msg.role === 'user'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 text-gray-900'
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))
              )}
              {isChatLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-200 p-3 rounded-lg">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask about your finances..."
                className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isChatLoading}
              />
              <Button onClick={handleSendMessage} disabled={isChatLoading || !chatInput.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}