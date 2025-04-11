import api, { fetchApi, postApi, putApi, deleteApi } from '@/lib/api';

export interface Book {
  id: number;
  title: string;
  author: string;
  description: string;
  isbn: string;
  total_copies: number;
  available_copies: number;
  category: string;
  cover_image?: string;
}

export interface BorrowedBook {
  id: number;
  book_id: number;
  book_title: string;
  book_author: string;
  cover_image?: string;
  borrowed_date: string;
  due_date: string;
  returned_date: string | null;
  status: string;
  is_overdue: boolean;
}

export interface WishlistItem {
  id: number;
  book_id: number;
  book_title: string;
  book_author: string;
  book_status: string;
  book_category: string;
  added_date: string;
}

// Book listing with optional filtering
export const getBooks = async (category?: string, search?: string) => {
  const params: any = {};
  if (category && category !== 'all') params.category = category;
  if (search) params.search = search;
  
  return fetchApi<Book[]>('/books', params);
};

// Get a specific book
export const getBook = async (id: number) => {
  return fetchApi<Book>(`/books/${id}`);
};

// Create a new book (admin only)
export const createBook = async (bookData: Omit<Book, 'id'>) => {
  return postApi<Book>('/books', bookData);
};

// Update a book (admin only)
export const updateBook = async (id: number, bookData: Partial<Book>) => {
  return putApi<Book>(`/books/${id}`, bookData);
};

// Delete a book (admin only)
export const deleteBook = async (id: number) => {
  return deleteApi(`/books/${id}`);
};

// Borrow a book
export const borrowBook = async (bookId: number, dueDate?: string) => {
  return postApi('/reader/borrow', {
    book_id: bookId,
    due_date: dueDate
  });
};

// Return a book
export const returnBook = async (borrowingId: number) => {
  return postApi('/reader/return', {
    borrowing_id: borrowingId
  });
};

// Get user's borrowed books
export const getMyBooks = async (status?: string) => {
  const params: any = {};
  if (status) params.status = status;
  
  return fetchApi<BorrowedBook[]>('/reader/my-books', params);
};

// Add a book to wishlist
export const addToWishlist = async (bookId: number) => {
  return postApi<WishlistItem>('/reader/wishlist/add', {
    book_id: bookId
  });
};

// Remove a book from wishlist
export const removeFromWishlist = async (itemId: number) => {
  return deleteApi(`/reader/wishlist/${itemId}`);
};

// Get user's wishlist
export const getWishlist = async () => {
  return fetchApi<WishlistItem[]>('/reader/wishlist');
};
