"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, BookOpen } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Image from "next/image";
import { useState } from "react";

const availableBooks = [
  {
    id: 1,
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    cover: "https://source.unsplash.com/400x600?book-cover",
    genre: "Classic",
    available: true,
    rating: 4.5,
    totalCopies: 3,
    availableCopies: 2,
  },
  {
    id: 2,
    title: "1984",
    author: "George Orwell",
    cover: "https://source.unsplash.com/400x600?book",
    genre: "Science Fiction",
    available: true,
    rating: 4.8,
    totalCopies: 5,
    availableCopies: 3,
  },
  {
    id: 3,
    title: "To Kill a Mockingbird",
    author: "Harper Lee",
    cover: "https://source.unsplash.com/400x600?library",
    genre: "Classic",
    available: true,
    rating: 4.7,
    totalCopies: 4,
    availableCopies: 1,
  },
  {
    id: 4,
    title: "The Hobbit",
    author: "J.R.R. Tolkien",
    cover: "https://source.unsplash.com/400x600?fantasy",
    genre: "Fantasy",
    available: true,
    rating: 4.6,
    totalCopies: 6,
    availableCopies: 4,
  },
  {
    id: 5,
    title: "Pride and Prejudice",
    author: "Jane Austen",
    cover: "https://source.unsplash.com/400x600?classic",
    genre: "Romance",
    available: true,
    rating: 4.4,
    totalCopies: 3,
    availableCopies: 2,
  },
  {
    id: 6,
    title: "Dune",
    author: "Frank Herbert",
    cover: "https://source.unsplash.com/400x600?sci-fi",
    genre: "Science Fiction",
    available: true,
    rating: 4.9,
    totalCopies: 4,
    availableCopies: 3,
  },
];

const genres = ["All", "Classic", "Science Fiction", "Fantasy", "Romance", "Mystery"];

export default function BrowseBooks() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [sortBy, setSortBy] = useState("title");

  const filteredBooks = availableBooks
    .filter((book) => {
      const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          book.author.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesGenre = selectedGenre === "All" || book.genre === selectedGenre;
      return matchesSearch && matchesGenre;
    })
    .sort((a, b) => {
      if (sortBy === "title") return a.title.localeCompare(b.title);
      if (sortBy === "author") return a.author.localeCompare(b.author);
      if (sortBy === "rating") return b.rating - a.rating;
      return 0;
    });

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight mb-2">Browse Books</h2>
        <p className="text-muted-foreground">
          Discover and borrow from our collection of books
        </p>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by title or author..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-4">
          <Select value={selectedGenre} onValueChange={setSelectedGenre}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Genre" />
            </SelectTrigger>
            <SelectContent>
              {genres.map((genre) => (
                <SelectItem key={genre} value={genre}>
                  {genre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="title">Sort by Title</SelectItem>
              <SelectItem value="author">Sort by Author</SelectItem>
              <SelectItem value="rating">Sort by Rating</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredBooks.map((book) => (
          <Card key={book.id} className="flex flex-col overflow-hidden group">
            <div className="relative aspect-[2/3] w-full overflow-hidden">
              <Image
                src={book.cover}
                alt={book.title}
                fill
                className="object-cover transition-transform group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
            <CardHeader className="flex-none">
              <CardTitle className="line-clamp-1">{book.title}</CardTitle>
              <p className="text-sm text-muted-foreground">{book.author}</p>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="secondary">{book.genre}</Badge>
                <Badge variant="outline">
                  {book.availableCopies} of {book.totalCopies} available
                </Badge>
              </div>
              <div className="mt-2 flex items-center gap-1">
                <span className="text-sm font-medium">{book.rating}</span>
                <span className="text-sm text-muted-foreground">/ 5.0</span>
              </div>
            </CardContent>
            <CardFooter className="pt-0">
              <Button className="w-full" disabled={book.availableCopies === 0}>
                {book.availableCopies > 0 ? "Borrow Book" : "Not Available"}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {filteredBooks.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-2 py-12">
          <BookOpen className="h-12 w-12 text-muted-foreground" />
          <h3 className="text-lg font-semibold">No books found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search or filter criteria
          </p>
        </div>
      )}
    </div>
  );
}