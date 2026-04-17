import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CategoryManagement } from './CategoryManagement';

global.fetch = jest.fn();

describe('CategoryManagement Component', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
  });

  const mockCategories = [
    {
      id: 'cat-1',
      name: 'Groceries',
      icon: '🛒',
      color: '#10b981',
      isSystem: true,
    },
    {
      id: 'cat-2',
      name: 'Custom',
      icon: '🎯',
      color: '#3b82f6',
      isSystem: false,
    },
  ];

  it('should render loading state initially', () => {
    (fetch as jest.Mock).mockImplementation(() =>
      new Promise(() => {}) // Never resolves
    );

    render(<CategoryManagement userId="user-123" />);
    expect(screen.getByText('Loading categories...')).toBeInTheDocument();
  });

  it('should display all categories', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockCategories,
    });

    render(<CategoryManagement userId="user-123" />);

    await waitFor(() => {
      expect(screen.getByText('Groceries')).toBeInTheDocument();
      expect(screen.getByText('Custom')).toBeInTheDocument();
    });
  });

  it('should show system badge on system categories', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockCategories,
    });

    render(<CategoryManagement userId="user-123" />);

    await waitFor(() => {
      const systemBadges = screen.getAllByText('System');
      expect(systemBadges.length).toBeGreaterThan(0);
    });
  });

  it('should not show delete button for system categories', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockCategories,
    });

    render(<CategoryManagement userId="user-123" />);

    await waitFor(() => {
      expect(screen.getByText('Groceries')).toBeInTheDocument();
    });

    // Find the Groceries card and verify no delete button
    const groceriesCard = screen.getByText('Groceries').closest('div');
    const deleteButton = groceriesCard?.querySelector('button');
    expect(deleteButton).toBeNull();
  });

  it('should show delete button for custom categories', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockCategories,
    });

    render(<CategoryManagement userId="user-123" />);

    await waitFor(() => {
      expect(screen.getByText('Custom')).toBeInTheDocument();
    });

    // Custom category should have delete button
    const deleteButtons = screen.getAllByText('Delete');
    expect(deleteButtons.length).toBeGreaterThan(0);
  });

  it('should show form when add category button is clicked', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockCategories,
    });

    render(<CategoryManagement userId="user-123" />);

    await waitFor(() => {
      expect(screen.getByText('Groceries')).toBeInTheDocument();
    });

    const addButton = screen.getByText('+ Add Category');
    fireEvent.click(addButton);

    expect(screen.getByText('Add New Category')).toBeInTheDocument();
  });

  it('should submit new category', async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockCategories,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 'cat-3',
          name: 'New Category',
          icon: '✨',
          isSystem: false,
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [...mockCategories],
      });

    render(<CategoryManagement userId="user-123" />);

    await waitFor(() => {
      expect(screen.getByText('Groceries')).toBeInTheDocument();
    });

    const addButton = screen.getByText('+ Add Category');
    fireEvent.click(addButton);

    const nameInput = screen.getByPlaceholderText('e.g., Entertainment');
    const submitButton = screen.getByText('Create Category');

    await userEvent.type(nameInput, 'New Category');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Category created successfully!')).toBeInTheDocument();
    });
  });

  it('should delete custom category', async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockCategories,
      })
      .mockResolvedValueOnce({
        ok: true,
      });

    render(<CategoryManagement userId="user-123" />);

    await waitFor(() => {
      expect(screen.getByText('Custom')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]);

    // Mock confirm dialog
    window.confirm = jest.fn(() => true);

    await waitFor(() => {
      expect(screen.getByText('Category deleted!')).toBeInTheDocument();
    });
  });
});
