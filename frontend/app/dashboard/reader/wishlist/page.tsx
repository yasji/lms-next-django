"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, BookOpen, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

type WishlistItem = {
  id: number;
  book_id: number;
  book_title: string;
  book_author: string;
  book_status: string;
  book_category: string;
  added_date: string;
};

export default function WishlistPage() {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/reader/wishlist`, {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        setWishlistItems(data);
        setFilteredItems(data);
      } else {
        console.error("Failed to fetch wishlist");
        toast({
          title: "Error",
          description: "Failed to fetch your wishlist",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching wishlist:", error);
      toast({
        title: "Error",
        description: "An error occurred while fetching your wishlist",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = wishlistItems.filter(
        (item) =>
          item.book_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.book_author.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredItems(filtered);
    } else {
      setFilteredItems(wishlistItems);
    }
  }, [searchQuery, wishlistItems]);

  const handleBorrowBook = async (bookId: number) => {
    try {
      const response = await fetch(`${API_URL}/reader/borrow`, {
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
          description: "Book borrowed successfully",
        });
        fetchWishlist(); // Refresh wishlist
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

  const handleRemoveFromWishlist = async (itemId: number) => {
    try {
      const response = await fetch(`${API_URL}/reader/wishlist/${itemId}`, {
        method: "DELETE",
        credentials: 'include',
      });
      
      if (response.ok) {
        toast({
          title: "Success",
          description: "Book removed from wishlist",
        });
        fetchWishlist(); // Refresh wishlist
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.detail || "Failed to remove book from wishlist",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      toast({
        title: "Error",
        description: "An error occurred while removing the book from wishlist",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight mb-2">My Wishlist</h2>
        <p className="text-muted-foreground">
          Books you want to read in the future
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search your wishlist..."
          className="pl-8"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="py-12 flex justify-center">Loading wishlist...</div>
      ) : filteredItems.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredItems.map((item) => (
            <Card key={item.id} className="flex flex-col">
              <CardHeader>
                <CardTitle className="line-clamp-1">{item.book_title}</CardTitle>
                <p className="text-sm text-muted-foreground">{item.book_author}</p>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant={item.book_status === "Available" ? "secondary" : "outline"}>
                    {item.book_status}
                  </Badge>
                  <Badge variant="outline">{item.book_category}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Added on {new Date(item.added_date).toLocaleDateString()}
                </p>
              </CardContent>
              <CardFooter className="flex gap-2">
                <Button 
                  className="flex-1" 
                  onClick={() => handleBorrowBook(item.book_id)}
                  disabled={item.book_status !== "Available"}
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  {item.book_status === "Available" ? "Borrow Now" : "Join Waitlist"}
                </Button>
                <Button 
                  variant="outline" 
                  className="p-0 h-9 w-9 flex items-center justify-center"
                  onClick={() => handleRemoveFromWishlist(item.id)}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
          <BookOpen className="h-12 w-12 text-muted-foreground" />
          <h3 className="text-lg font-semibold">Your wishlist is empty</h3>
          <p className="text-muted-foreground max-w-md">
            Browse the library and add books to your wishlist to keep track of what you want to read next.
          </p>
          <Button className="mt-4" onClick={() => window.location.href = "/dashboard/reader"}>
            Browse Books
          </Button>
        </div>
      )}
    </div>
  );
}