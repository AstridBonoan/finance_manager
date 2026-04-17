import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DashboardSummary } from './DashboardSummary';

// Mock fetch globally
global.fetch = jest.fn();

describe('DashboardSummary Component', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
  });

  it('should render loading state initially', () => {
    (fetch as jest.Mock).mockImplementation(() =>
      new Promise(() => {}) // Never resolves
    );

    render(<DashboardSummary userId="user-123" />);
    expect(screen.getByText('Loading dashboard...')).toBeInTheDocument();
  });

  it('should render dashboard data when fetched successfully', async () => {
    const mockData = {
      totalIncome: 5000,
      totalExpenses: 2000,
      balance: 3000,
      transactionCount: 10,
      categoryBreakdown: [],
      recentTransactions: [],
      allCategories: [],
    };

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    render(<DashboardSummary userId="user-123" />);

    await waitFor(() => {
      expect(screen.getByText('$5000.00')).toBeInTheDocument();
    });

    expect(screen.getByText('$2000.00')).toBeInTheDocument();
    expect(screen.getByText('$3000.00')).toBeInTheDocument();
  });

  it('should render error state on fetch failure', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    render(<DashboardSummary userId="user-123" />);

    await waitFor(() => {
      expect(screen.getByText(/Error:/)).toBeInTheDocument();
    });
  });

  it('should display metric cards with correct labels', async () => {
    const mockData = {
      totalIncome: 5000,
      totalExpenses: 2000,
      balance: 3000,
      transactionCount: 10,
      categoryBreakdown: [],
      recentTransactions: [],
      allCategories: [],
    };

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    render(<DashboardSummary userId="user-123" />);

    await waitFor(() => {
      expect(screen.getByText('Total Income')).toBeInTheDocument();
      expect(screen.getByText('Total Expenses')).toBeInTheDocument();
      expect(screen.getByText('Balance')).toBeInTheDocument();
      expect(screen.getByText('Transactions')).toBeInTheDocument();
    });
  });
});
