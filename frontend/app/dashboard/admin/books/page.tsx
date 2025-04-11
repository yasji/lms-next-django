"use client";

import { useState, useEffect } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Pencil, 
  Trash2, 
  Plus, 
  ArrowUpDown
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { DataTable } from "@/components/data-table/data-table";
import { BookForm, BookFormData } from "@/components/book/book-form";

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

export default function BooksManagement() {
  const [isAddBookOpen, setIsAddBookOpen] = useState(false);
  const [isEditBookOpen, setIsEditBookOpen] = useState(false);
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentBook, setCurrentBook] = useState<Book | null>(null);
  const { toast } = useToast();

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/books`, {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        setBooks(data);
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

  const handleAddBook = async (formData: BookFormData) => {
    try {
      const bookData = {
        title: formData.title,
        author: formData.author,
        isbn: formData.isbn,
        category: formData.category,
        description: formData.description || null,
        total_copies: parseInt(formData.total_copies),
        available_copies: formData.available_copies ? parseInt(formData.available_copies) : null,
        cover_image: formData.cover_image || null,
      };
      
      const response = await fetch(`${API_URL}/books`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookData),
        credentials: 'include',
      });
      
      if (response.ok) {
        toast({
          title: "Success",
          description: "Book added successfully",
        });
        fetchBooks();
        setIsAddBookOpen(false);
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.detail || "Failed to add book",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error adding book:", error);
      toast({
        title: "Error",
        description: "An error occurred while adding the book",
        variant: "destructive",
      });
    }
  };

  const handleEditBook = async (formData: BookFormData) => {
    if (!currentBook) return;
    
    try {
      const bookData = {
        title: formData.title,
        author: formData.author,
        isbn: formData.isbn,
        category: formData.category,
        description: formData.description,
        total_copies: parseInt(formData.total_copies),
        available_copies: parseInt(formData.available_copies || formData.total_copies),
        cover_image: formData.cover_image,
      };
      
      const response = await fetch(`${API_URL}/books/${currentBook.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookData),
        credentials: 'include',
      });
      
      if (response.ok) {
        toast({
          title: "Success",
          description: "Book updated successfully",
        });
        fetchBooks();
        setIsEditBookOpen(false);
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.detail || "Failed to update book",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating book:", error);
      toast({
        title: "Error",
        description: "An error occurred while updating the book",
        variant: "destructive",
      });
    }
  };

  const handleDeleteBook = async (bookId: number) => {
    if (!window.confirm("Are you sure you want to delete this book?")) {
      return;
    }
    
    try {
      const response = await fetch(`${API_URL}/books/${bookId}`, {
        method: "DELETE",
        credentials: 'include',
      });
      
      if (response.ok) {
        toast({
          title: "Success",
          description: "Book deleted successfully",
        });
        fetchBooks();
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.detail || "Failed to delete book",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting book:", error);
      toast({
        title: "Error",
        description: "An error occurred while deleting the book",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (book: Book) => {
    setCurrentBook(book);
    setIsEditBookOpen(true);
  };

  // Define table columns
  const columns: ColumnDef<Book>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "title",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Title
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <div className="font-medium">{row.getValue("title")}</div>,
    },
    {
      accessorKey: "author",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Author
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
    },
    {
      accessorKey: "isbn",
      header: "ISBN",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        return (
          <Badge
            variant={status === "Available" ? "default" : "secondary"}
            className={cn(
              status === "Low Stock" && "bg-yellow-500/15 text-yellow-500 hover:bg-yellow-500/25",
              status === "Unavailable" && "bg-red-500/15 text-red-500 hover:bg-red-500/25"
            )}
          >
            {status}
          </Badge>
        );
      },
    },
    {
      accessorKey: "total_copies",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Total
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <div className="text-center">{row.getValue("total_copies")}</div>,
    },
    {
      accessorKey: "available_copies",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Available
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <div className="text-center">{row.getValue("available_copies")}</div>,
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => <div className="capitalize">{row.getValue("category")}</div>,
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const book = row.original;
        return (
          <div className="flex justify-end gap-2">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => openEditDialog(book)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-red-500 hover:text-red-600 hover:bg-red-50"
              onClick={() => handleDeleteBook(book.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Books Management</h1>
          <p className="text-muted-foreground">Manage your library's book collection</p>
        </div>
        <Dialog open={isAddBookOpen} onOpenChange={setIsAddBookOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Book
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Book</DialogTitle>
              <DialogDescription>
                Add a new book to your library collection.
              </DialogDescription>
            </DialogHeader>
            <BookForm 
              onSubmit={handleAddBook} 
              onCancel={() => setIsAddBookOpen(false)}
              submitText="Add Book"
            />
          </DialogContent>
        </Dialog>

        <Dialog open={isEditBookOpen} onOpenChange={setIsEditBookOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Book</DialogTitle>
              <DialogDescription>
                Update book information.
              </DialogDescription>
            </DialogHeader>
            {currentBook && (
              <BookForm 
                initialData={{
                  title: currentBook.title,
                  author: currentBook.author,
                  isbn: currentBook.isbn,
                  category: currentBook.category,
                  description: currentBook.description || "",
                  total_copies: currentBook.total_copies.toString(),
                  available_copies: currentBook.available_copies.toString(),
                  cover_image: currentBook.cover_image || "",
                }}
                onSubmit={handleEditBook} 
                onCancel={() => setIsEditBookOpen(false)}
                submitText="Update Book"
              />
            )}
          </DialogContent>
        </Dialog>
      </div>

      <DataTable 
        columns={columns}
        data={books}
        loading={loading}
        filterColumn="title"
        filterPlaceholder="Filter books..."
        loadingText="Loading books..."
        emptyText="No books found."
      />
    </div>
  );
}