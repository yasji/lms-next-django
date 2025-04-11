"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { ProtectedRoute } from "@/components/protected-route";
import { getEvent, getEventAttendees, markAttendance } from "@/services/eventService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Calendar, Loader2, Mail, User } from "lucide-react";
import { formatDate, formatTime } from "@/lib/utils";
import Link from "next/link";

export default function EventAttendeesPage() {
  const { id } = useParams<{ id: string }>();
  const eventId = parseInt(id);
  const [event, setEvent] = useState(null);
  const [attendees, setAttendees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Load event details and attendees in parallel
        const [eventData, attendeesData] = await Promise.all([
          getEvent(eventId),
          getEventAttendees(eventId)
        ]);
        
        setEvent(eventData);
        setAttendees(attendeesData);
      } catch (error) {
        console.error("Failed to load event data:", error);
        toast({
          title: "Error",
          description: "Failed to load event data. Please try again later.",
          variant: "destructive"
        });
        router.push("/dashboard/admin/events");
      } finally {
        setIsLoading(false);
      }
    };

    if (eventId) {
      loadData();
    }
  }, [eventId, router, toast]);

  const handleAttendanceChange = async (userId: number, attended: boolean) => {
    setIsUpdating(true);
    try {
      await markAttendance(eventId, userId, attended);
      
      // Update local state
      setAttendees(prev => 
        prev.map(reg => 
          reg.user.id === userId ? { ...reg, attended } : reg
        )
      );
      
      toast({
        title: "Success",
        description: `Attendance ${attended ? 'marked' : 'unmarked'} successfully`,
        variant: "default"
      });
    } catch (error) {
      console.error("Failed to update attendance:", error);
      toast({
        title: "Error",
        description: "Failed to update attendance. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const isPastEvent = event ? new Date(event.end_date) < new Date() : false;

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Event Attendees</h2>
            <p className="text-muted-foreground">
              Manage attendees and track attendance
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/dashboard/admin/events">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Events
            </Link>
          </Button>
        </div>
        
        {isLoading ? (
          <Card>
            <CardContent className="flex h-[400px] items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="ml-2">Loading event data...</p>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle>{event.title}</CardTitle>
                <CardDescription>
                  <div className="flex items-center mt-1">
                    <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>
                      {formatDate(event.start_date)} • {formatTime(event.start_date)} - {formatTime(event.end_date)}
                    </span>
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="font-medium">Registered Attendees: {attendees.length}</p>
                    {event.capacity > 0 && (
                      <p className="text-sm text-muted-foreground">
                        Event Capacity: {event.capacity} ({Math.round((attendees.length / event.capacity) * 100)}% filled)
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      {attendees.filter(a => a.attended).length} checked in
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {Math.round((attendees.filter(a => a.attended).length / attendees.length) * 100) || 0}% attendance rate
                    </p>
                  </div>
                </div>
                
                {attendees.length === 0 ? (
                  <div className="text-center py-8 border rounded-md">
                    <User className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                    <h3 className="text-lg font-medium mb-1">No Registrations</h3>
                    <p className="text-muted-foreground">No one has registered for this event yet</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Registration Date</TableHead>
                        <TableHead className="text-right">Attended</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {attendees.map((registration) => (
                        <TableRow key={registration.id}>
                          <TableCell className="font-medium">
                            {`${registration.user.first_name} ${registration.user.last_name}`.trim() || 
                             registration.user.username}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                              <span>{registration.user.email}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {formatDate(registration.registration_date)}
                          </TableCell>
                          <TableCell className="text-right">
                            <Checkbox 
                              checked={registration.attended} 
                              onCheckedChange={(checked) => 
                                handleAttendanceChange(registration.user.id, !!checked)
                              }
                              disabled={isUpdating || (!isPastEvent && !isEventOngoing(event))}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
                
                {!isPastEvent && !isEventOngoing(event) && (
                  <p className="text-sm text-muted-foreground mt-4 text-center">
                    Attendance can only be marked during or after the event
                  </p>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </ProtectedRoute>
  );
}

// Helper function to check if an event is currently ongoing
function isEventOngoing(event) {
  const now = new Date();
  const startDate = new Date(event.start_date);
  const endDate = new Date(event.end_date);
  
  return now >= startDate && now <= endDate;
}
