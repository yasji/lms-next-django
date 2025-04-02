"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Calendar, Users, Clock, MapPin, Filter } from "lucide-react";

const events = [
  {
    id: "1",
    title: "Book Reading: The Great Gatsby",
    date: "2024-03-25",
    time: "14:00",
    location: "Main Reading Room",
    category: "Book Reading",
    attendees: 45,
    description: "Join us for a reading and discussion of F. Scott Fitzgerald's masterpiece.",
    image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=400&h=300&fit=crop",
  },
  {
    id: "2",
    title: "Children's Story Time",
    date: "2024-03-26",
    time: "10:00",
    location: "Children's Section",
    category: "Children",
    attendees: 20,
    description: "Weekly story time session for children aged 4-8 years.",
    image: "https://images.unsplash.com/photo-1549737221-bef65e2604a6?q=80&w=400&h=300&fit=crop",
  },
  {
    id: "3",
    title: "Author Meet & Greet",
    date: "2024-03-28",
    time: "16:00",
    location: "Conference Room",
    category: "Meet & Greet",
    attendees: 75,
    description: "Meet bestselling author Sarah Johnson and get your books signed.",
    image: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?q=80&w=400&h=300&fit=crop",
  },
];

export default function EventsPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Upcoming Events</h2>
          <p className="text-muted-foreground">
            Discover and join library events
          </p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search events..." className="pl-8 w-[300px]" />
          </div>
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => (
          <Card key={event.id} className="relative group overflow-hidden">
            <div className="aspect-video relative">
              <img
                src={event.image}
                alt={event.title}
                className="object-cover w-full h-full transition-transform group-hover:scale-105"
              />
              <Badge className="absolute top-2 right-2">{event.category}</Badge>
            </div>
            <CardHeader className="space-y-1">
              <CardTitle className="line-clamp-1">{event.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground line-clamp-2">
                {event.description}
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{event.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{event.time}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{event.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>{event.attendees} attending</span>
                </div>
              </div>
              <div className="pt-4">
                <Button className="w-full">Register Now</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}