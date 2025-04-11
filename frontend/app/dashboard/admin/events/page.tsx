"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getEvents, deleteEvent, Event } from "@/services/eventService";
import { formatDate, formatRelativeTime } from "@/lib/utils";
import { Calendar, PlusCircle, Search, Edit, Trash2, Clock, Users } from "lucide-react";
import Link from "next/link";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";

export default function AdminEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState<string | undefined>();
  const [tabValue, setTabValue] = useState<"all" | "upcoming" | "past">("all");
  const { toast } = useToast();

  const fetchEvents = async () => {
    setLoading(true);
    try {
      // Only pass filters with actual values
      const filters: Record<string, any> = {};
      
      if (searchTerm) filters.search = searchTerm;
      // Only add category filter if it's not "all"
      if (category && category !== "all") filters.category = category;
      
      // Only set upcoming_only if the tab is "upcoming"
      if (tabValue === "upcoming") {
        filters.upcoming_only = true;
      }
      
      const eventsData = await getEvents(filters);
      console.log("Events data received:", eventsData); // Add logging to verify data
      
      // If showing past events, filter client-side
      if (tabValue === "past") {
        const now = new Date();
        const pastEvents = eventsData.filter(event => 
          new Date(event.end_date) < now
        );
        console.log("Past events filtered:", pastEvents); // Add logging
        setEvents(pastEvents);
      } else {
        setEvents(eventsData);
      }
    } catch (error) {
      console.error("Failed to load events:", error);
      // Set empty events array on error so UI doesn't stay in loading state
      setEvents([]);
      toast({
        title: "Error",
        description: "Failed to load events. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [searchTerm, category, tabValue, toast]);

  const handleDeleteEvent = async (eventId: number) => {
    try {
      await deleteEvent(eventId);
      toast({
        title: "Success",
        description: "Event has been deleted.",
        variant: "default"
      });
      fetchEvents(); // Refresh the list
    } catch (error) {
      console.error("Failed to delete event:", error);
      toast({
        title: "Error",
        description: "Failed to delete event. Please try again.",
        variant: "destructive"
      });
    }
  };

  const EVENT_CATEGORIES = [
    "Workshop",
    "Seminar",
    "Book Club",
    "Author Talk",
    "Reading Session",
    "Children's Event",
    "Exhibition",
    "Other"
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Events</h2>
          <p className="text-muted-foreground">
            Manage library events and registrations
          </p>
        </div>
        
        <Button asChild>
          <Link href="/dashboard/admin/events/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Event
          </Link>
        </Button>
      </div>
      
      <div className="flex flex-col gap-4 md:flex-row">
        <div className="relative md:w-80">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="md:w-44">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {EVENT_CATEGORIES.map(cat => (
              <SelectItem key={cat} value={cat}>
                {cat || "Uncategorized"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <Tabs defaultValue="all" value={tabValue} onValueChange={(value) => setTabValue(value as any)}>
        <TabsList>
          <TabsTrigger value="all">All Events</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="past">Past Events</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-4">
          {renderEventsTable()}
        </TabsContent>
        
        <TabsContent value="upcoming" className="mt-4">
          {renderEventsTable()}
        </TabsContent>
        
        <TabsContent value="past" className="mt-4">
          {renderEventsTable()}
        </TabsContent>
      </Tabs>
    </div>
  );

  function renderEventsTable() {
    if (loading) {
      return (
        <div className="flex h-40 items-center justify-center">
          <Calendar className="mr-2 h-5 w-5 animate-spin" />
          <p>Loading events...</p>
        </div>
      );
    }

    // Make sure events is always an array even if it's undefined
    const eventsList = events || [];
    console.log("Events about to render:", eventsList); // Add logging
    
    if (eventsList.length === 0) {
      return (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="mb-4 h-12 w-12 text-muted-foreground" />
            <CardTitle className="mb-2 text-xl">No events found</CardTitle>
            <CardDescription>
              {searchTerm || category 
                ? "Try adjusting your search or filters"
                : tabValue === "upcoming" 
                  ? "No upcoming events scheduled"
                  : tabValue === "past"
                    ? "No past events found"
                    : "Create your first event to get started"}
            </CardDescription>
            {!searchTerm && !category && (
              <Button asChild className="mt-4">
                <Link href="/dashboard/admin/events/new">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create Event
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      );
    }

    return (
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Event</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Registrations</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {eventsList.map((event) => {
                const isPastEvent = new Date(event.end_date) < new Date();
                const isFullyBooked = event.capacity > 0 && event.registered_count >= event.capacity;
                
                return (
                  <TableRow key={event.id}>
                    <TableCell className="font-medium">
                      <Link 
                        href={`/events/${event.id}`} 
                        className="hover:underline"
                      >
                        {event.title}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Calendar className="mr-1 h-4 w-4 text-muted-foreground" />
                        <span>{formatDate(event.start_date)}</span>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="mr-1 h-3 w-3" />
                        <span>{formatRelativeTime(event.start_date)}</span>
                      </div>
                    </TableCell>
                    <TableCell>{event.location}</TableCell>
                    <TableCell>
                      {event.category ? (
                        <Badge variant="outline">{event.category}</Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {!event.is_active ? (
                        <Badge variant="outline">Inactive</Badge>
                      ) : isPastEvent ? (
                        <Badge variant="secondary">Completed</Badge>
                      ) : isFullyBooked ? (
                        <Badge>Fully Booked</Badge>
                      ) : (
                        <Badge variant="outline" className="ml-2 bg-green-100">
                          Active
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Users className="mr-1 h-4 w-4 text-muted-foreground" />
                        <span>{event.registered_count}</span>
                        {event.capacity > 0 && (
                          <span className="ml-1 text-sm text-muted-foreground">
                            /{event.capacity}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button asChild variant="ghost" size="icon">
                          <Link href={`/dashboard/admin/events/${event.id}/attendees`}>
                            <Users className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button asChild variant="ghost" size="icon">
                          <Link href={`/dashboard/admin/events/${event.id}/edit`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Event</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{event.title}"? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDeleteEvent(event.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    );
  }
}