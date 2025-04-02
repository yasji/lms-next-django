"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Clock, AlertTriangle } from "lucide-react";

const borrowedBooks = [
  {
    id: 1,
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    cover: "/books/gatsby.jpg",
    borrowedDate: "2024-02-15",
    dueDate: "2024-03-15",
    progress: 75,
    isOverdue: false,
  },
  {
    id: 2,
    title: "1984",
    author: "George Orwell",
    cover: "/books/1984.jpg",
    borrowedDate: "2024-02-20",
    dueDate: "2024-03-20",
    progress: 30,
    isOverdue: false,
  },
  {
    id: 3,
    title: "To Kill a Mockingbird",
    author: "Harper Lee",
    cover: "/books/mockingbird.jpg",
    borrowedDate: "2024-01-25",
    dueDate: "2024-02-25",
    progress: 100,
    isOverdue: true,
  },
];

export default function MyBooks() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Books</h1>
        <p className="text-muted-foreground">Manage your borrowed books and reading progress</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Reading Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Currently Reading</p>
                  <p className="text-2xl font-bold">3</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Due Soon</p>
                  <p className="text-2xl font-bold">2</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <div>
                  <p className="text-sm font-medium">Overdue</p>
                  <p className="text-2xl font-bold text-red-500">1</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="current" className="space-y-4">
          <TabsList>
            <TabsTrigger value="current">Currently Borrowed</TabsTrigger>
            <TabsTrigger value="history">Borrowing History</TabsTrigger>
          </TabsList>
          <TabsContent value="current" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {borrowedBooks.map((book) => (
                <Card key={book.id} className="flex flex-col">
                  <CardHeader className="flex-1">
                    <div className="aspect-[3/4] relative mb-4">
                      <img
                        src={book.cover}
                        alt={book.title}
                        className="object-cover rounded-lg w-full h-full"
                      />
                      <Badge
                        variant={book.isOverdue ? "destructive" : "secondary"}
                        className="absolute top-2 right-2"
                      >
                        {book.isOverdue ? "Overdue" : "Due " + book.dueDate}
                      </Badge>
                    </div>
                    <CardTitle className="line-clamp-1">{book.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">{book.author}</p>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span>Reading Progress</span>
                        <span>{book.progress}%</span>
                      </div>
                      <Progress value={book.progress} className="h-2" />
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-muted-foreground">Borrowed</p>
                        <p className="font-medium">{book.borrowedDate}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Due Date</p>
                        <p className={`font-medium ${book.isOverdue ? "text-red-500" : ""}`}>
                          {book.dueDate}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full" variant={book.isOverdue ? "destructive" : "default"}>
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
                <CardTitle>Coming Soon</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Your borrowing history will appear here.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 