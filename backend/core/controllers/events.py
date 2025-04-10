from ninja_extra import api_controller, route
from typing import List, Optional
from django.shortcuts import get_object_or_404
from django.db.models import Count, Q
from django.http import Http404
from django.utils import timezone
from django.db.utils import OperationalError, ProgrammingError
from core.models.event import Event, EventRegistration
from core.schemas.events import EventIn, EventOut,EventRegistrationOut

# from .models import Event, EventRegistration, User
# from .schemas import EventIn, EventOut, EventRegistrationIn, EventRegistrationOut
from ..permissions import IsAuthenticated, IsAdmin

is_authenticated = IsAuthenticated()
is_admin = IsAdmin()

@api_controller('/events')
class EventsController:
    
    @route.get('/', response=List[EventOut])
    def list_events(self, request, 
                   search: Optional[str] = None,
                   category: Optional[str] = None,
                   upcoming_only: bool = False):
        """List all events with optional filtering - public endpoint"""
        try:
            events = Event.objects.annotate(
                registered_count=Count('registrations')
            )
            
            if search:
                events = events.filter(
                    Q(title__icontains=search) | 
                    Q(description__icontains=search) |
                    Q(location__icontains=search)
                )
                
            if category:
                events = events.filter(category=category)
                
            if upcoming_only:
                now = timezone.now()
                events = events.filter(end_date__gte=now)
            
            # Only show active events to non-staff users
            # Check if user exists and has staff permissions
            is_staff = hasattr(request, 'user') and request.user and hasattr(request.user, 'is_staff') and request.user.is_staff
            if not is_staff:
                events = events.filter(is_active=True)
                
            return events
        except (OperationalError, ProgrammingError) as e:
            # Handle database table not existing
            print(f"Database error in list_events: {str(e)}")
            return []  # Return empty list if table doesn't exist
    
    @route.get('/{int:event_id}', response=EventOut)
    def get_event(self, request, event_id: int):
        print("Event ID:", event_id)
        """Get a specific event by ID - public endpoint"""
        try:
            event = Event.objects.annotate(
                registered_count=Count('registrations')
            ).get(id=event_id)
            print(f"Event retrieved: {event.title}")
            
            # Check if event is active if not admin
            # If request doesn't have a user attribute or user is not authenticated, treat as public
            is_staff = hasattr(request, 'user') and request.user and hasattr(request.user, 'is_staff') and request.user.is_staff
            
            # Only enforce active check for non-staff users
            if not is_staff and not event.is_active:
                raise Http404
                
            return event
        except (Event.DoesNotExist, OperationalError, ProgrammingError) as e:
            # Log the error
            print(f"Error retrieving event {event_id}: {str(e)}")
            raise Http404
    
    @route.post('/', response=EventOut, auth=is_admin)
    def create_event(self, request, payload: EventIn):
        """Create a new event (admin only)"""
        event = Event.objects.create(
            title=payload.title,
            description=payload.description,
            location=payload.location,
            start_date=payload.start_date,
            end_date=payload.end_date,
            capacity=payload.capacity,
            category=payload.category,
            image=payload.image,
            is_active=payload.is_active,
            created_by=request.user
        )
        
        # Annotate with registered count for response
        event.registered_count = 0
        return event
    
    @route.put('/{int:event_id}', response=EventOut, auth=is_admin)
    def update_event(self, request, event_id: int, payload: EventIn):
        """Update an existing event (admin only)"""
        event = get_object_or_404(Event, id=event_id)
        
        event.title = payload.title
        event.description = payload.description
        event.location = payload.location
        event.start_date = payload.start_date
        event.end_date = payload.end_date
        event.capacity = payload.capacity
        event.category = payload.category
        event.is_active = payload.is_active
        
        if payload.image:
            event.image = payload.image
            
        event.save()
        
        # Annotate with registered count for response
        event.registered_count = event.registrations.count()
        return event
    
    @route.delete('/{int:event_id}', auth=is_admin)
    def delete_event(self, request, event_id: int):
        """Delete an event (admin only)"""
        event = get_object_or_404(Event, id=event_id)
        event.delete()
        return {"success": True}
    
    @route.post('/{int:event_id}/register', response=EventRegistrationOut, auth=is_authenticated)
    def register_for_event(self, request, event_id: int):
        """Register the current user for an event"""
        event = get_object_or_404(Event, id=event_id)
        
        # Check if event is active
        if not event.is_active:
            return {"error": "This event is not active"}, 400
            
        # Check if event has passed
        if event.end_date < timezone.now():
            return {"error": "This event has already ended"}, 400
            
        # Check if event has capacity left
        if event.capacity > 0 and event.registrations.count() >= event.capacity:
            return {"error": "This event has reached its capacity"}, 400
            
        # Check if user is already registered
        if EventRegistration.objects.filter(event=event, user=request.user).exists():
            return {"error": "You are already registered for this event"}, 400
            
        # Register user
        registration = EventRegistration.objects.create(
            event=event,
            user=request.user
        )
        
        return registration
    
    @route.delete('/{int:event_id}/unregister', auth=is_authenticated)
    def unregister_from_event(self, request, event_id: int):
        """Unregister the current user from an event"""
        event = get_object_or_404(Event, id=event_id)
        
        # Check if event has passed
        if event.start_date < timezone.now():
            return {"error": "Cannot unregister from a past or ongoing event"}, 400
            
        # Check if user is registered
        try:
            registration = EventRegistration.objects.get(event=event, user=request.user)
            registration.delete()
            return {"success": True}
        except EventRegistration.DoesNotExist:
            return {"error": "You are not registered for this event"}, 404
    
    @route.get('/user/registrations', response=List[EventRegistrationOut], auth=is_authenticated)
    def get_user_registrations(self, request):
        """Get all events the current user is registered for"""
        registrations = EventRegistration.objects.filter(user=request.user)
        return registrations
    
    @route.put('/{int:event_id}/attendance/{int:user_id}', auth=is_admin)
    def mark_attendance(self, request, event_id: int, user_id: int, attended: bool):
        """Mark a user as attended or not attended for an event (admin only)"""
        registration = get_object_or_404(EventRegistration, event_id=event_id, user_id=user_id)
        registration.attended = attended
        registration.save()
        return {"success": True}
    
    @route.get('/{int:event_id}/attendees', response=List[EventRegistrationOut], auth=is_admin)
    def get_event_attendees(self, request, event_id: int):
        """Get all users registered for an event (admin only)"""
        registrations = EventRegistration.objects.filter(event_id=event_id)
        return registrations
