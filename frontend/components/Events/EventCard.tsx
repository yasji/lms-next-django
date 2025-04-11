import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, Users } from "lucide-react";
import { formatDate, formatTime } from "@/lib/utils";
import { Event } from "@/services/eventService";
import Link from "next/link";

interface EventCardProps {
  event: Event;
  isAdmin?: boolean;
  isRegistered?: boolean;
  onRegister?: (eventId: number) => void;
  onUnregister?: (eventId: number) => void;
}

export function EventCard({ 
  event, 
  isAdmin = false,
  isRegistered = false,
  onRegister,
  onUnregister
}: EventCardProps) {
  const isPastEvent = new Date(event.end_date) < new Date();
  const isFullyBooked = event.capacity > 0 && event.registered_count >= event.capacity;
  
  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      {event.image && (
        <div className="relative h-48 w-full overflow-hidden">
          <img 
            src={event.image} 
            alt={event.title} 
            className="h-full w-full object-cover"
          />
        </div>
      )}
      
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="line-clamp-1">{event.title}</CardTitle>
          {event.category && (
            <Badge variant="outline" className="ml-2">
              {event.category}
            </Badge>
          )}
        </div>
        
        <CardDescription className="line-clamp-2">{event.description}</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-2">
        <div className="flex items-center text-sm">
          <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
          <span>{formatDate(event.start_date)}</span>
        </div>
        
        <div className="flex items-center text-sm">
          <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
          <span>{formatTime(event.start_date)} - {formatTime(event.end_date)}</span>
        </div>
        
        <div className="flex items-center text-sm">
          <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
          <span className="line-clamp-1">{event.location}</span>
        </div>
        
        <div className="flex items-center text-sm">
          <Users className="mr-2 h-4 w-4 text-muted-foreground" />
          <span>
            {event.registered_count} registered
            {event.capacity > 0 ? ` (${event.capacity - event.registered_count} spots left)` : ''}
          </span>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button asChild variant="outline">
          <Link href={`/events/${event.id}`}>
            View Details
          </Link>
        </Button>
        
        {isAdmin ? (
          <Button asChild variant="outline">
            <Link href={`/dashboard/admin/events/${event.id}/edit`}>
              Edit Event
            </Link>
          </Button>
        ) : (
          !isPastEvent && (
            isRegistered ? (
              <Button 
                variant="secondary" 
                onClick={() => onUnregister?.(event.id)}
                disabled={isPastEvent}
              >
                Cancel Registration
              </Button>
            ) : (
              <Button 
                onClick={() => onRegister?.(event.id)}
                disabled={isPastEvent || isFullyBooked || !event.is_active}
              >
                {isFullyBooked ? 'Fully Booked' : 'Register'}
              </Button>
            )
          )
        )}
      </CardFooter>
    </Card>
  );
}
