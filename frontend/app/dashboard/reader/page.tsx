"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, BookOpen } from "lucide-react";
import { useState, useEffect } from "react";
import Image from "next/image";
import { useToast } from "@/components/ui/use-toast";
import { DashboardLayout } from "@/components/Layout/DashboardLayout";
import { getBooks } from "@/services/bookService";

type Book = {
  id: number;
  title: string;
  author: string;
  isbn: string;
  status: string;
  total_copies: number;
  available_copies: number;
  borrowed: number;
  category: string;
  description?: string;
  cover_image?: string;
};

const fallbackCoverImage = "/books/default-cover.jpg";

export default function BrowseBooks() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [sortBy, setSortBy] = useState("title");
  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

  const genres = [
    "All", 
    "Fiction", 
    "Non-Fiction", 
    "Science", 
    "History", 
    "Biography", 
    "Fantasy", 
    "Mystery", 
    "Romance", 
    "Thriller", 
    "Poetry", 
    "Other"
  ];

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/books`, {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        setBooks(data);
        setFilteredBooks(data);
      } else {
        console.error("Failed to fetch books");
        toast({
          title: "Error",
          description: "Failed to fetch books",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching books:", error);
      toast({
        title: "Error",
        description: "An error occurred while fetching books",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  useEffect(() => {
    let filtered = [...books];
    
    // Apply genre filter
    if (selectedGenre !== "All") {
      filtered = filtered.filter(
        (book) => book.category.toLowerCase() === selectedGenre.toLowerCase()
      );
    }
    
    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (book) =>
          book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          book.author.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      if (sortBy === "title") return a.title.localeCompare(b.title);
      if (sortBy === "author") return a.author.localeCompare(b.author);
      if (sortBy === "availability") return b.available_copies - a.available_copies;
      return 0;
    });
    
    setFilteredBooks(filtered);
  }, [books, searchQuery, selectedGenre, sortBy]);

  const handleBorrowBook = async (bookId: number) => {
    try {
      const response = await fetch(`${API_URL}/reader/borrow`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          book_id: bookId,
          // Due date is set to 14 days by default in the backend
        }),
        credentials: 'include',
      });
      
      if (response.ok) {
        toast({
          title: "Success",
          description: "Book borrowed successfully",
        });
        fetchBooks(); // Refresh books to update availability
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.detail || "Failed to borrow book",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error borrowing book:", error);
      toast({
        title: "Error",
        description: "An error occurred while borrowing the book",
        variant: "destructive",
      });
    }
  };

  const handleAddToWishlist = async (bookId: number) => {
    try {
      const response = await fetch(`${API_URL}/reader/wishlist/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          book_id: bookId,
        }),
        credentials: 'include',
      });
      
      if (response.ok) {
        toast({
          title: "Success",
          description: "Book added to wishlist",
        });
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.detail || "Failed to add book to wishlist",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error adding to wishlist:", error);
      toast({
        title: "Error",
        description: "An error occurred while adding the book to wishlist",
        variant: "destructive",
      });
    }
  };

  return (
    <DashboardLayout requireReader={true}>
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
                <SelectItem value="availability">Sort by Availability</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {loading ? (
          <div className="py-12 flex justify-center">Loading books...</div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredBooks.map((book) => (
              <Card key={book.id} className="flex flex-col overflow-hidden group">
                <div className="relative aspect-[2/3] w-full overflow-hidden">
                  <img
                    src={book.cover_image || fallbackCoverImage}
                    alt={book.title}
                    className="object-cover w-full h-full transition-transform group-hover:scale-105"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = fallbackCoverImage;
                    }}
                  />
                </div>
                <CardHeader className="flex-none">
                  <h3 className="text-lg font-semibold line-clamp-1">{book.title}</h3>
                  <p className="text-sm text-muted-foreground">{book.author}</p>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="secondary">{book.category}</Badge>
                    <Badge variant="outline">
                      {book.available_copies} of {book.total_copies} available
                    </Badge>
                  </div>
                  {book.description && (
                    <p className="mt-2 text-sm text-muted-foreground line-clamp-3">
                      {book.description}
                    </p>
                  )}
                </CardContent>
                <CardFooter className="pt-0 flex gap-2">
                  <Button 
                    className="flex-1" 
                    disabled={book.available_copies === 0}
                    onClick={() => handleBorrowBook(book.id)}
                  >
                    {book.available_copies > 0 ? "Borrow Book" : "Not Available"}
                  </Button>
                  <Button 
                    variant="outline" 
                    className="px-3"
                    onClick={() => handleAddToWishlist(book.id)}
                  >
                    ❤
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {!loading && filteredBooks.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-2 py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground" />
            <h3 className="text-lg font-semibold">No books found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search or filter criteria
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}