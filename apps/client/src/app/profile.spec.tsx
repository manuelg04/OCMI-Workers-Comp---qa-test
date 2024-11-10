import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import UserProfile from './profile';
import { useApiFetch } from '../hooks';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { Mock } from '@vitest/spy';
import { User } from '@qa-assessment/shared';
import { Book } from '../components/book-search';

vi.mock('../hooks', () => ({
  useApiFetch: vi.fn(),
}));

vi.mock('../lib', () => ({
  apiUrl: (path: string) => path,
}));

vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn(),
}));

vi.mock('../components', () => ({
  Alert: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  AlertDescription: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  Book: () => <div>Book</div>,
  Button: ({
    children,
    ...props
  }: { children: React.ReactNode } & React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button {...props}>{children}</button>
  ),
  Card: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardContent: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  CardHeader: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  CardTitle: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('lucide-react', () => ({
  Pencil: () => <svg>Pencil Icon</svg>,
  User: () => <svg>User Icon</svg>,
}));

vi.mock('../components/book-search', () => ({
  __esModule: true,
  default: ({
    onSelect,
    open,
    onOpenChange,
  }: {
    onSelect: (book: Book) => void;
    open: boolean;
    onOpenChange: (open: boolean) => void;
  }) => (
    <div>
      {open && (
        <button
          onClick={() => {
            onSelect &&
              onSelect({
                key: 'book1',
                title: 'Selected Book',
                author_name: ['Author Name'],
                first_publish_year: 2021,
              });
            onOpenChange && onOpenChange(false);
          }}
        >
          Select Book
        </button>
      )}
    </div>
  ),
}));

type ExtendedUser = Omit<User, 'favoriteBook'> & {
  favoriteBook?: {
    key: string;
    title: string;
    author_name?: string[];
    first_publish_year?: number;
  } | null;
};

describe('UserProfile Component', () => {
  const mockGet = vi.fn();
  const mockPut = vi.fn();
  const mockUseApiFetch = {
    data: null as ExtendedUser | null,
    error: null as Error | null,
    isLoading: false,
    get: mockGet,
    put: mockPut,
  };

  const mockStorageData = {
    userId: '123',
  };

  beforeEach(() => {
    vi.clearAllMocks();

    mockUseApiFetch.data = null;
    mockUseApiFetch.error = null;
    mockUseApiFetch.isLoading = false;

    (useApiFetch as Mock).mockReturnValue(mockUseApiFetch);

    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn().mockReturnValue(JSON.stringify(mockStorageData)),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
      },
      writable: true,
    });
  });

  it('should render loading state when isLoading is true', () => {
    mockUseApiFetch.isLoading = true;

    render(<UserProfile />);

    expect(screen.getByText('Loading profile...')).toBeInTheDocument();
  });

  it('should render error state when there is an error', () => {
    mockUseApiFetch.isLoading = false;
    mockUseApiFetch.error = new Error('Failed to fetch');

    render(<UserProfile />);

    expect(screen.getByText('Error loading profile')).toBeInTheDocument();
  });

  it('should fetch user data on mount', () => {
    render(<UserProfile />);

    expect(mockGet).toHaveBeenCalledWith('/users/123');
  });

  it('should render user profile when data is available', () => {
    mockUseApiFetch.data = {
      id: '123',
      username: 'testuser',
      password: 'mockpassword',
      favoriteBook: null,
    };

    render(<UserProfile />);

    expect(screen.getByText('testuser')).toBeInTheDocument();
    expect(screen.getByText('123')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('No favorite book selected')).toBeInTheDocument();
  });

  it('should display favorite book when available', () => {
    mockUseApiFetch.data = {
      id: '123',
      username: 'testuser',
      password: 'mockpassword',
      favoriteBook: {
        key: 'book1',
        title: 'Book Title',
        author_name: ['Author Name'],
      },
    };

    render(<UserProfile />);

    expect(screen.getByText('Book Title')).toBeInTheDocument();
    expect(screen.getByText('by Author Name')).toBeInTheDocument();
  });

  it('should allow editing favorite book', async () => {
    mockUseApiFetch.data = {
      id: '123',
      username: 'testuser',
      password: 'mockpassword',
      favoriteBook: null,
    };

    render(<UserProfile />);

    const editButton = screen.getByRole('button');

    fireEvent.click(editButton);

    const selectBookButton = screen.getByText('Select Book');

    fireEvent.click(selectBookButton);

    await waitFor(() => {
      expect(mockPut).toHaveBeenCalledWith('/users/123', {
        id: '123',
        username: 'testuser',
        password: 'mockpassword',
        favoriteBook: {
          key: 'book1',
          title: 'Selected Book',
          author_name: ['Author Name'],
          first_publish_year: 2021,
        },
      });
      expect(mockGet).toHaveBeenCalledTimes(2);
    });
  });

  it('should handle update favorite book errors gracefully', async () => {
    mockUseApiFetch.data = {
      id: '123',
      username: 'testuser',
      password: 'mockpassword',
      favoriteBook: null,
    };

    mockPut.mockRejectedValue(new Error('Update failed'));

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(<UserProfile />);

    const editButton = screen.getByRole('button');

    fireEvent.click(editButton);

    const selectBookButton = screen.getByText('Select Book');

    fireEvent.click(selectBookButton);

    await waitFor(() => {
      expect(mockPut).toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error updating favorite book:',
        expect.any(Error)
      );
    });

    consoleErrorSpy.mockRestore();
  });

  it('should toggle editing state when edit button is clicked', () => {
    mockUseApiFetch.data = {
      id: '123',
      username: 'testuser',
      password: 'mockpassword',
      favoriteBook: null,
    };

    render(<UserProfile />);

    const editButton = screen.getByRole('button');

    fireEvent.click(editButton);

    expect(screen.getByText('Select Book')).toBeInTheDocument();

    fireEvent.click(editButton);

    expect(screen.queryByText('Select Book')).not.toBeInTheDocument();
  });
});
