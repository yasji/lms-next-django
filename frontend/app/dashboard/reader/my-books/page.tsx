"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Clock, BookOpen, ArrowLeft, CheckCircle2, Search } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";

type BookBorrowing = {
  id: number;
  book_id: number;
  book_title: string;
  borrowed_date: string;
  cover_image: string | null;
  due_date: string;
  returned_date: string | null;
  status: string;
  is_overdue: boolean;
};

const fallbackCoverImage = "/books/default-cover.jpg";

export default function MyBooks() {
  const [borrowings, setBorrowings] = useState<BookBorrowing[]>([]);
  const [activeBorrowings, setActiveBorrowings] = useState<BookBorrowing[]>([]);
  const [history, setHistory] = useState<BookBorrowing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

  const fetchBorrowings = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/reader/my-books`, {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        setBorrowings(data);
        
        // Split into active and history
        const active = data.filter((b: BookBorrowing) => b.status === 'active');
        const past = data.filter((b: BookBorrowing) => b.status === 'returned');
        
        setActiveBorrowings(active);
        setHistory(past);
      } else {
        console.error("Failed to fetch borrowings");
        toast({
          title: "Error",
          description: "Failed to fetch your books",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching borrowings:", error);
      toast({
        title: "Error",
        description: "An error occurred while fetching your books",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBorrowings();
  }, []);

  const handleReturnBook = async (borrowingId: number) => {
    try {
      const response = await fetch(`${API_URL}/reader/return`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          borrowing_id: borrowingId,
        }),
        credentials: 'include',
      });
      
      if (response.ok) {
        toast({
          title: "Success",
          description: "Book returned successfully",
        });
        fetchBorrowings(); // Refresh data
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.detail || "Failed to return book",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error returning book:", error);
      toast({
        title: "Error",
        description: "An error occurred while returning the book",
        variant: "destructive",
      });
    }
  };

  const getFilteredBorrowings = (items: BookBorrowing[], query: string) => {
    if (!query) return items;
    return items.filter(item => 
      item.book_title.toLowerCase().includes(query.toLowerCase())
    );
  };

  const filteredActive = getFilteredBorrowings(activeBorrowings, searchQuery);
  const filteredHistory = getFilteredBorrowings(history, searchQuery);

  const getDaysLeft = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">My Books</h2>
          <p className="text-muted-foreground">
            Manage your borrowed books and track your reading progress
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Reading Overview</CardTitle>
            <CardDescription>Your current reading statistics</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col items-center justify-center p-4 bg-secondary/20 rounded-lg">
                <span className="text-2xl font-bold">{activeBorrowings.length}</span>
                <span className="text-xs text-muted-foreground">Currently Reading</span>
              </div>
              <div className="flex flex-col items-center justify-center p-4 bg-secondary/20 rounded-lg">
                <span className="text-2xl font-bold">
                  {activeBorrowings.filter(b => getDaysLeft(b.due_date) <= 3 && getDaysLeft(b.due_date) > 0).length}
                </span>
                <span className="text-xs text-muted-foreground">Due Soon</span>
              </div>
              <div className="flex flex-col items-center justify-center p-4 bg-secondary/20 rounded-lg">
                <span className="text-2xl font-bold">
                  {activeBorrowings.filter(b => b.is_overdue).length}
                </span>
                <span className="text-xs text-muted-foreground">Overdue</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mb-4 relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search books..."
          className="pl-8"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <Tabs defaultValue="current" className="space-y-4">
        <TabsList>
          <TabsTrigger value="current">Currently Borrowed</TabsTrigger>
          <TabsTrigger value="history">Borrowing History</TabsTrigger>
        </TabsList>
        <TabsContent value="current" className="space-y-4">
          {loading ? (
            <div className="py-12 flex justify-center">Loading your books...</div>
          ) : filteredActive.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
              {filteredActive.map((borrowing) => (
                <Card key={borrowing.id} className="flex flex-col overflow-hidden group hover:shadow-lg transition-shadow duration-200">
                  <div className="relative aspect-[2/3] w-full overflow-hidden">
                  <img
                    src={borrowing.cover_image || fallbackCoverImage}
                    alt={borrowing.book_title}
                    className="object-cover w-full h-full transition-transform group-hover:scale-105 duration-200"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = fallbackCoverImage;
                    }}
                  />
                </div>
                  <CardHeader className="flex-1 pb-2">
                    <CardTitle className="line-clamp-1">{borrowing.book_title}</CardTitle>
                    <CardDescription>
                      Borrowed on: {new Date(borrowing.borrowed_date).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 pt-0">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4" />
                      <span>Due: {new Date(borrowing.due_date).toLocaleDateString()}</span>
                    </div>
                    <div>
                      {borrowing.is_overdue ? (
                        <Badge variant="destructive">Overdue</Badge>
                      ) : getDaysLeft(borrowing.due_date) <= 3 ? (
                        <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-200">
                          Due Soon ({getDaysLeft(borrowing.due_date)} days left)
                        </Badge>
                      ) : (
                        <Badge variant="outline">
                          {getDaysLeft(borrowing.due_date)} days left
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => handleReturnBook(borrowing.id)}
                    >
                      Return Book
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
              <BookOpen className="h-12 w-12 text-muted-foreground" />
              <h3 className="text-lg font-semibold">No borrowed books</h3>
              <p className="text-muted-foreground max-w-md">
                You don't have any books currently borrowed.
              </p>
              <Button className="mt-4" onClick={() => window.location.href = "/dashboard/reader"}>
                Browse Books
              </Button>
            </div>
          )}
        </TabsContent>
        <TabsContent value="history">
          {loading ? (
            <div className="py-12 flex justify-center">Loading history...</div>
          ) : filteredHistory.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredHistory.map((borrowing) => (
                <Card key={borrowing.id} className="flex flex-col overflow-hidden">
                  <CardHeader className="flex-1">
                    <CardTitle className="line-clamp-1">{borrowing.book_title}</CardTitle>
                    <CardDescription>
                      Borrowed: {new Date(borrowing.borrowed_date).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4" />
                      <span>Due: {new Date(borrowing.due_date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span>Returned: {new Date(borrowing.returned_date as string).toLocaleDateString()}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
              <BookOpen className="h-12 w-12 text-muted-foreground" />
              <h3 className="text-lg font-semibold">No borrowing history</h3>
              <p className="text-muted-foreground max-w-md">
                Your borrowing history will appear here once you've returned some books.
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}