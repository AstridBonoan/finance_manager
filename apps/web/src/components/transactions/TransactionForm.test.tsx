import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TransactionForm } from './TransactionForm';

global.fetch = jest.fn();

describe('TransactionForm Component', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
  });

  const mockCategories = [
    { id: 'cat-1', name: 'Groceries', icon: '🛒' },
    { id: 'cat-2', name: 'Dining', icon: '🍽️' },
  ];

  it('should render form fields', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockCategories,
    });

    render(<TransactionForm userId="user-123" />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('e.g., Grocery shopping')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('0.00')).toBeInTheDocument();
      expect(screen.getByDisplayValue('expense')).toBeInTheDocument();
    });
  });

  it('should load categories on mount', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockCategories,
    });

    render(<TransactionForm userId="user-123" />);

    await waitFor(() => {
      expect(screen.getByText('🛒 Groceries')).toBeInTheDocument();
      expect(screen.getByText('🍽️ Dining')).toBeInTheDocument();
    });
  });

  it('should submit form with valid data', async () => {
    const onSuccess = jest.fn();

    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockCategories,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 'tx-123' }),
      });

    render(<TransactionForm userId="user-123" onSuccess={onSuccess} />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('e.g., Grocery shopping')).toBeInTheDocument();
    });

    const descriptionInput = screen.getByPlaceholderText('e.g., Grocery shopping');
    const amountInput = screen.getByPlaceholderText('0.00');
    const submitButton = screen.getByText('Add Transaction');

    await userEvent.type(descriptionInput, 'Test expense');
    await userEvent.type(amountInput, '50.00');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Transaction created successfully!')).toBeInTheDocument();
    });
  });

  it('should show error on submission failure', async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockCategories,
      })
      .mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Invalid amount' }),
      });

    render(<TransactionForm userId="user-123" />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('e.g., Grocery shopping')).toBeInTheDocument();
    });

    const descriptionInput = screen.getByPlaceholderText('e.g., Grocery shopping');
    const amountInput = screen.getByPlaceholderText('0.00');
    const submitButton = screen.getByText('Add Transaction');

    await userEvent.type(descriptionInput, 'Test');
    await userEvent.type(amountInput, '50.00');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Invalid amount/)).toBeInTheDocument();
    });
  });

  it('should require description and amount', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockCategories,
    });

    render(<TransactionForm userId="user-123" />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('e.g., Grocery shopping')).toBeInTheDocument();
    });

    const submitButton = screen.getByText('Add Transaction');
    fireEvent.click(submitButton);

    // Form should not submit without required fields
    expect(fetch).toHaveBeenCalledTimes(1); // Only categories fetch
  });
});
