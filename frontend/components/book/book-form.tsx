import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface BookFormData {
  title: string;
  author: string;
  isbn: string;
  category: string;
  description: string;
  total_copies: string;
  available_copies: string;
  cover_image: string;
}

interface BookFormProps {
  initialData?: BookFormData;
  onSubmit: (data: BookFormData) => void;
  onCancel: () => void;
  submitText?: string;
}

export function BookForm({
  initialData,
  onSubmit,
  onCancel,
  submitText = "Submit",
}: BookFormProps) {
  const [formData, setFormData] = useState<BookFormData>({
    title: "",
    author: "",
    isbn: "",
    category: "fiction",
    description: "",
    total_copies: "1",
    available_copies: "",
    cover_image: "",
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (value: string, field: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-4 py-4">
        <div className="grid gap-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            placeholder="Enter book title"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="author">Author</Label>
          <Input
            id="author"
            placeholder="Enter author name"
            value={formData.author}
            onChange={handleChange}
            required
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="isbn">ISBN</Label>
          <Input
            id="isbn"
            placeholder="Enter ISBN"
            value={formData.isbn}
            onChange={handleChange}
            required
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="category">Category</Label>
          <Select
            value={formData.category}
            onValueChange={(value) => handleSelectChange(value, "category")}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fiction">Fiction</SelectItem>
              <SelectItem value="non-fiction">Non-Fiction</SelectItem>
              <SelectItem value="science">Science</SelectItem>
              <SelectItem value="history">History</SelectItem>
              <SelectItem value="biography">Biography</SelectItem>
              <SelectItem value="fantasy">Fantasy</SelectItem>
              <SelectItem value="mystery">Mystery</SelectItem>
              <SelectItem value="romance">Romance</SelectItem>
              <SelectItem value="thriller">Thriller</SelectItem>
              <SelectItem value="poetry">Poetry</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="total_copies">Total Copies</Label>
          <Input
            id="total_copies"
            type="number"
            min="1"
            placeholder="Enter number of copies"
            value={formData.total_copies}
            onChange={handleChange}
            required
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="available_copies">Available Copies (Optional)</Label>
          <Input
            id="available_copies"
            type="number"
            min="0"
            placeholder="Enter available copies (defaults to total)"
            value={formData.available_copies}
            onChange={handleChange}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="cover_image">Cover Image URL (Optional)</Label>
          <Input
            id="cover_image"
            placeholder="Enter cover image URL"
            value={formData.cover_image}
            onChange={handleChange}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="description">Description (Optional)</Label>
          <Textarea
            id="description"
            placeholder="Enter book description"
            value={formData.description}
            onChange={handleChange}
          />
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="outline" type="button" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">{submitText}</Button>
      </div>
    </form>
  );
}
