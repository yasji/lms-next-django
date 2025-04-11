// Define common types used across the application

// Standard API response structure
export interface ResponseData<T> {
  data: T;
  message?: string;
  success: boolean;
}

// User type definition
export interface User {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role: string;
  is_active: boolean;
}

// Error response type
export interface ErrorResponse {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}
