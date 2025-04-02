"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Trash2, BookOpen } from "lucide-react";

const wishlist = [
  {
    id: "1",
    title: "The Midnight Library",
    author: "Matt Haig",
    cover: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=400&h=600&fit=crop",
    status: "Available",
    category: "Fiction",
    addedDate: "2024-02-15",
  },
  {
    id: "2",
    title: "Atomic Habits",
    author: "James Clear",
    cover: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=400&h=600&fit=crop",
    status: "Borrowed",
    category: "Self-Help",
    addedDate: "2024-02-20",
  },
  {
    id: "3",
    title: "Project Hail Mary",
    author: "Andy Weir",
    cover: "https://images.unsplash.com/photo-1541963463532-d68292c34b19?q=80&w=400&h=600&fit=crop",
    status: "Available",
    category: "Science Fiction",
    addedDate: "2024-03-01",
  },
];

export default function WishlistPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">My Wishlist</h2>
          <p className="text-muted-foreground">
            Books you want to read in the future
          </p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search wishlist..." className="pl-8 w-[300px]" />
          </div>
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {wishlist.map((book) => (
          <Card key={book.id} className="overflow-hidden group">
            <div className="relative aspect-[2/3]">
              <img
                src={book.cover}
                alt={book.title}
                className="object-cover w-full h-full transition-transform group-hover:scale-105"
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm hover:bg-background/90"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <CardContent className="p-4">
              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold leading-none">{book.title}</h3>
                  <p className="text-sm text-muted-foreground">{book.author}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={book.status === "Available" ? "secondary" : "outline"}>
                    {book.status}
                  </Badge>
                  <Badge variant="outline">{book.category}</Badge>
                </div>
                <Button className="w-full gap-2">
                  <BookOpen className="h-4 w-4" />
                  {book.status === "Available" ? "Borrow Now" : "Join Waitlist"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}