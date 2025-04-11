"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { EventInput, getEvent, updateEvent, formatDateForInput } from "@/services/eventService";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

// Form validation schema
const eventSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  location: z.string().min(3, "Location must be at least 3 characters"),
  start_date: z.string().min(1, "Start date is required"),
  end_date: z.string().min(1, "End date is required"),
  capacity: z.coerce.number().int().min(0, "Capacity must be a positive number"),
  category: z.string().optional(),
  is_active: z.boolean().default(true),
});

type EventFormValues = z.infer<typeof eventSchema>;

export default function EditEventPage() {
  const { id } = useParams();
  const eventId = Number(id);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  // Initialize the form
  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: "",
      description: "",
      location: "",
      start_date: "",
      end_date: "",
      capacity: 0,
      category: "",
      is_active: true,
    },
  });

  // Fetch event data
  useEffect(() => {
    const loadEvent = async () => {
      try {
        setLoading(true);
        const eventData = await getEvent(eventId);
        
        if (!eventData) {
          toast({
            title: "Error",
            description: "Event not found or you don't have permission to edit it.",
            variant: "destructive"
          });
          router.push("/dashboard/admin/events");
          return;
        }

        // Safely format dates to prevent invalid date errors
        const formattedStartDate = formatDateForInput(eventData.start_date);
        const formattedEndDate = formatDateForInput(eventData.end_date);

        // Set the form values
        form.reset({
          title: eventData.title,
          description: eventData.description,
          location: eventData.location,
          start_date: formattedStartDate,
          end_date: formattedEndDate,
          capacity: eventData.capacity,
          category: eventData.category || "",
          is_active: eventData.is_active,
        });
      } catch (error) {
        console.error("Error loading event:", error);
        toast({
          title: "Error",
          description: "Failed to load event data. Please try again later.",
          variant: "destructive"
        });
        router.push("/dashboard/admin/events");
      } finally {
        setLoading(false);
      }
    };

    loadEvent();
  }, [eventId, toast, router, form]);

  // Handle form submission
  const onSubmit = async (data: EventFormValues) => {
    setSubmitting(true);
    try {
      await updateEvent(eventId, data as EventInput);
      toast({
        title: "Success",
        description: "Event has been updated successfully.",
      });
      router.push("/dashboard/admin/events");
    } catch (error) {
      console.error("Error updating event:", error);
      toast({
        title: "Error",
        description: "Failed to update event. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
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

  if (loading) {
    return (
      <div className="container max-w-2xl py-10">
        <div className="flex justify-center items-center h-60">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <span className="ml-2">Loading event data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl py-10">
      <div className="flex items-center mb-6">
        <Link 
          href="/dashboard/admin/events" 
          className="flex items-center text-sm hover:underline"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to Events
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Edit Event</CardTitle>
          <CardDescription>
            Update the details for this event.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Event title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Event description" 
                        rows={5} 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="Event location" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="start_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date & Time</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="end_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Date & Time</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="capacity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Capacity (0 for unlimited)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select 
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">None</SelectItem>
                          {EVENT_CATEGORIES.map(category => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Active</FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Active events are visible to users and can be registered for.
                      </p>
                    </div>
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/dashboard/admin/events")}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
