import api from '@/lib/api';

// Define ResponseData type locally since @/types module is missing
interface ResponseData<T> {
  data: T;
  message?: string;
  success: boolean;
}

// Define TimeRange type with the correct values
export type TimeRange = 'day' | 'week' | 'month' | 'year' | 'all' | '6months';

// Add the following interface and function to your existing analyticsService.ts file

export interface EventAnalytics {
  totalEvents: number;
  totalRegistrations: number;
  avgRegistrationsPerEvent: number;
  eventsByCategory: {
    category: string;
    count: number;
  }[];
  activityOverTime: {
    month: string;
    events: number;
    registrations: number;
  }[];
}

export const getEventAnalytics = async (timeRange: TimeRange = '6months'): Promise<EventAnalytics> => {
  try {
    const response = await api.get<ResponseData<EventAnalytics>>('/admin/analytics/events', {
      params: { timeRange }
    });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching event analytics:', error);
    throw error;
  }
};

// Get analytics data
export const getAnalytics = async (timeRange: TimeRange): Promise<any> => {
  try {
    const response = await api.get<ResponseData<any>>('/analytics/', { params: { time_range: timeRange } });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching analytics:', error);
    throw error;
  }
};

// Get popular books
export const getPopularBooks = async (timeRange: TimeRange = 'month'): Promise<any> => {
  try {
    const response = await api.get<ResponseData<any>>('/analytics/popular-books', { params: { time_range: timeRange } });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching popular books:', error);
    throw error;
  }
};

// Get active users
export const getActiveUsers = async (timeRange: TimeRange = 'month'): Promise<any> => {
  try {
    const response = await api.get<ResponseData<any>>('/analytics/active-users', { params: { time_range: timeRange } });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching active users:', error);
    throw error;
  }
};

// Get borrowing trends
export const getBorrowingTrends = async (timeRange: TimeRange = 'month'): Promise<any> => {
  try {
    const response = await api.get<ResponseData<any>>('/analytics/borrowing-trends', { params: { time_range: timeRange } });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching borrowing trends:', error);
    throw error;
  }
};
