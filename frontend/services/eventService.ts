import api from '@/lib/api';
import { ResponseData } from '@/types';

export interface Event {
  id: number;
  title: string;
  description: string;
  location: string;
  start_date: string;
  end_date: string;
  capacity: number;
  category?: string;
  image?: string;
  created_by: {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  created_at: string;
  updated_at: string;
  is_active: boolean;
  registered_count: number;
}

export interface EventRegistration {
  id: number;
  event: Event;
  user: {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  registration_date: string;
  attended: boolean;
}

export interface EventInput {
  title: string;
  description: string;
  location: string;
  start_date: string;
  end_date: string;
  capacity: number;
  category?: string;
  image?: string;
  is_active: boolean;
}

export interface EventFilters {
  search?: string;
  category?: string;
  upcoming_only?: boolean;
}

// Get all events with optional filtering
export const getEvents = async (filters?: EventFilters): Promise<Event[]> => {
  try {
    console.log("Fetching events with filters:", filters);
    const response = await api.get<Event[] | ResponseData<Event[]>>('/events', { params: filters });
    console.log("API response for events:", response.data);
    
    // Check if the response is an array (direct data) or wrapped in a data property
    if (Array.isArray(response.data)) {
      return response.data;
    } else if (response.data && 'data' in response.data) {
      return response.data.data;
    } else {
      console.warn("Unexpected response format:", response.data);
      return [];
    }
  } catch (error) {
    console.error('Error fetching events:', error);
    throw error;
  }
};

// Get a single event by ID
export const getEvent = async (eventId: number): Promise<Event | null> => {
  try {
    console.log(`Fetching event with ID: ${eventId}`);
    const response = await api.get<Event | ResponseData<Event>>(`/events/${eventId}`);
    console.log("API response for event:", response.data);
    
    // Check if the response is a direct object or wrapped in a data property
    if (Array.isArray(response.data)) {
      console.warn("Unexpected array response for single event");
      return null;
    } else if (response.data && !('data' in response.data)) {
      return response.data as Event;
    } else if (response.data && 'data' in response.data) {
      return response.data.data;
    } else {
      console.warn("Unexpected response format:", response.data);
      return null;
    }
  } catch (error) {
    console.error(`Error fetching event ${eventId}:`, error);
    // Return null instead of throwing to handle 401 errors gracefully
    return null;
  }
};

// Safe date formatting function to handle invalid dates
export const formatDateForInput = (dateString?: string): string => {
  if (!dateString) return '';
  
  try {
    // Try to parse the date
    const date = new Date(dateString);
    
    // Check if the date is valid
    if (isNaN(date.getTime())) {
      console.warn('Invalid date:', dateString);
      return '';
    }
    
    // Format as YYYY-MM-DDThh:mm
    return date.toISOString().slice(0, 16);
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
};

// Create a new event (admin only)
export const createEvent = async (eventData: EventInput): Promise<Event> => {
  try {
    const response = await api.post<ResponseData<Event>>('/events/', eventData);
    return response.data.data;
  } catch (error) {
    console.error('Error creating event:', error);
    throw error;
  }
};

// Update an existing event (admin only)
export const updateEvent = async (eventId: number, eventData: EventInput): Promise<Event> => {
  try {
    const response = await api.put<ResponseData<Event>>(`/events/${eventId}`, eventData);
    return response.data.data;
  } catch (error) {
    console.error(`Error updating event ${eventId}:`, error);
    throw error;
  }
};

// Delete an event (admin only)
export const deleteEvent = async (eventId: number): Promise<void> => {
  try {
    await api.delete(`/events/${eventId}`);
  } catch (error) {
    console.error(`Error deleting event ${eventId}:`, error);
    throw error;
  }
};

// Register current user for an event
export const registerForEvent = async (eventId: number): Promise<EventRegistration> => {
  try {
    const response = await api.post<ResponseData<EventRegistration>>(`/events/${eventId}/register`);
    return response.data.data;
  } catch (error) {
    console.error(`Error registering for event ${eventId}:`, error);
    throw error;
  }
};

// Unregister current user from an event
export const unregisterFromEvent = async (eventId: number): Promise<void> => {
  try {
    await api.delete(`/events/${eventId}/unregister`);
  } catch (error) {
    console.error(`Error unregistering from event ${eventId}:`, error);
    throw error;
  }
};

// Get all events the current user is registered for
export const getUserRegistrations = async (): Promise<EventRegistration[]> => {
  try {
    const response = await api.get<ResponseData<EventRegistration[]>>('/events/user/registrations');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching user registrations:', error);
    throw error;
  }
};

// Mark a user as attended or not attended for an event (admin only)
export const markAttendance = async (
  eventId: number, 
  userId: number, 
  attended: boolean
): Promise<void> => {
  try {
    await api.put(`/events/${eventId}/attendance/${userId}`, { attended });
  } catch (error) {
    console.error(`Error marking attendance for user ${userId} at event ${eventId}:`, error);
    throw error;
  }
};

// Get all users registered for an event (admin only)
export const getEventAttendees = async (eventId: number): Promise<EventRegistration[]> => {
  try {
    const response = await api.get<ResponseData<EventRegistration[]>>(`/events/${eventId}/attendees`);
    return response.data.data;
  } catch (error) {
    console.error(`Error fetching attendees for event ${eventId}:`, error);
    throw error;
  }
};
