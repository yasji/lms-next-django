"use client";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Star } from "lucide-react";

const history = [
  {
    id: "1",
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    borrowDate: "2024-01-15",
    returnDate: "2024-02-15",
    status: "Returned",
    rating: 5,
  },
  {
    id: "2",
    title: "1984",
    author: "George Orwell",
    borrowDate: "2024-02-01",
    returnDate: "2024-03-01",
    status: "Overdue",
    rating: 4,
  },
  {
    id: "3",
    title: "To Kill a Mockingbird",
    author: "Harper Lee",
    borrowDate: "2024-02-15",
    returnDate: "2024-03-15",
    status: "Active",
    rating: null,
  },
];

export default function HistoryPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Borrowing History</h2>
          <p className="text-muted-foreground">
            View your past and current book loans
          </p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search history..." className="pl-8 w-[300px]" />
          </div>
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Book</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Borrow Date</TableHead>
              <TableHead>Return Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {history.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.title}</TableCell>
                <TableCell>{item.author}</TableCell>
                <TableCell>{item.borrowDate}</TableCell>
                <TableCell>{item.returnDate}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      item.status === "Returned"
                        ? "success"
                        : item.status === "Overdue"
                        ? "destructive"
                        : "secondary"
                    }
                  >
                    {item.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {item.rating ? (
                    <div className="flex items-center">
                      {Array.from({ length: item.rating }).map((_, i) => (
                        <Star
                          key={i}
                          className="h-4 w-4 fill-yellow-400 text-yellow-400"
                        />
                      ))}
                    </div>
                  ) : (
                    <Button variant="ghost" size="sm">
                      Rate
                    </Button>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm">
                    View Details
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}