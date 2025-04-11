"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, BookOpen, Clock, LayoutList } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type BookBorrowing = {
  id: number;
  book_id: number;
  book_title: string;
  borrowed_date: string;
  due_date: string;
  returned_date: string | null;
  status: string;
  is_overdue: boolean;
};

export default function BorrowingHistoryPage() {
  const [history, setHistory] = useState<BookBorrowing[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<BookBorrowing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const { toast } = useToast();

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/reader/my-books?status=returned`, {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        setHistory(data);
        setFilteredHistory(data);
      } else {
        console.error("Failed to fetch borrowing history");
        toast({
          title: "Error",
          description: "Failed to fetch your borrowing history",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching borrowing history:", error);
      toast({
        title: "Error",
        description: "An error occurred while fetching your borrowing history",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = history.filter(
        (item) => item.book_title.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredHistory(filtered);
    } else {
      setFilteredHistory(history);
    }
  }, [searchQuery, history]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight mb-2">Borrowing History</h2>
          <p className="text-muted-foreground">
            Books you have borrowed and returned in the past
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant={viewMode === "grid" ? "default" : "outline"} 
            size="sm"
            onClick={() => setViewMode("grid")}
          >
            <BookOpen className="h-4 w-4 mr-2" />
            Grid
          </Button>
          <Button 
            variant={viewMode === "list" ? "default" : "outline"} 
            size="sm"
            onClick={() => setViewMode("list")}
          >
            <LayoutList className="h-4 w-4 mr-2" />
            List
          </Button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by book title..."
          className="pl-8"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="py-12 flex justify-center">Loading history...</div>
      ) : filteredHistory.length > 0 ? (
        viewMode === "grid" ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredHistory.map((item) => (
              <Card key={item.id}>
                <CardHeader>
                  <CardTitle className="line-clamp-1">{item.book_title}</CardTitle>
                  <CardDescription>
                    Borrowed: {new Date(item.borrowed_date).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4" />
                    <span>Due: {new Date(item.due_date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
                      Returned: {new Date(item.returned_date as string).toLocaleDateString()}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Book Title</TableHead>
                    <TableHead>Borrowed Date</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Returned Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredHistory.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.book_title}</TableCell>
                      <TableCell>{new Date(item.borrowed_date).toLocaleDateString()}</TableCell>
                      <TableCell>{new Date(item.due_date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
                          {new Date(item.returned_date as string).toLocaleDateString()}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )
      ) : (
        <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
          <BookOpen className="h-12 w-12 text-muted-foreground" />
          <h3 className="text-lg font-semibold">No borrowing history found</h3>
          <p className="text-muted-foreground max-w-md">
            You haven't borrowed and returned any books yet.
          </p>
          <Button className="mt-4" onClick={() => window.location.href = "/dashboard/reader"}>
            Browse Books
          </Button>
        </div>
      )}
    </div>
  );
}