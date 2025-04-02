"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Clock, BookOpen, ArrowLeft, CheckCircle2 } from "lucide-react";

// Mock data - Replace with actual API calls
const borrowedBooks = [
  {
    id: 1,
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    cover: "/books/gatsby.jpg",
    borrowedDate: "2024-03-15",
    dueDate: "2024-04-15",
    progress: 65,
    isOverdue: false,
  },
  {
    id: 2,
    title: "1984",
    author: "George Orwell",
    cover: "/books/1984.jpg",
    borrowedDate: "2024-03-01",
    dueDate: "2024-04-01",
    progress: 30,
    isOverdue: true,
  },
  {
    id: 3,
    title: "To Kill a Mockingbird",
    author: "Harper Lee",
    cover: "/books/mockingbird.jpg",
    borrowedDate: "2024-03-20",
    dueDate: "2024-04-20",
    progress: 15,
    isOverdue: false,
  },
];

export default function MyBooks() {
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
                <span className="text-2xl font-bold">{borrowedBooks.length}</span>
                <span className="text-xs text-muted-foreground">Currently Reading</span>
              </div>
              <div className="flex flex-col items-center justify-center p-4 bg-secondary/20 rounded-lg">
                <span className="text-2xl font-bold">2</span>
                <span className="text-xs text-muted-foreground">Due Soon</span>
              </div>
              <div className="flex flex-col items-center justify-center p-4 bg-secondary/20 rounded-lg">
                <span className="text-2xl font-bold">1</span>
                <span className="text-xs text-muted-foreground">Overdue</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="current" className="space-y-4">
        <TabsList>
          <TabsTrigger value="current">Currently Borrowed</TabsTrigger>
          <TabsTrigger value="history">Borrowing History</TabsTrigger>
        </TabsList>
        <TabsContent value="current" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {borrowedBooks.map((book) => (
              <Card key={book.id}>
                <CardHeader>
                  <CardTitle className="line-clamp-1">{book.title}</CardTitle>
                  <CardDescription>{book.author}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Reading Progress</span>
                      <span>{book.progress}%</span>
                    </div>
                    <Progress value={book.progress} />
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4" />
                    <span>Due: {new Date(book.dueDate).toLocaleDateString()}</span>
                    {book.isOverdue && (
                      <Badge variant="destructive" className="ml-auto">
                        Overdue
                      </Badge>
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">
                    Return Book
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Borrowing History</CardTitle>
              <CardDescription>
                Your previously borrowed and returned books will appear here
              </CardDescription>
            </CardHeader>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 