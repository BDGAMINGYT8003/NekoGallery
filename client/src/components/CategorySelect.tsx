import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Category {
  id: number;
  name: string;
  apiSource: string;
  isNsfw: boolean;
}

interface CategorySelectProps {
  selectedCategory: string | null;
  onCategoryChange: (category: string | null) => void;
  onLoadError: (error: string | null) => void; // New prop
}

export default function CategorySelect({ selectedCategory, onCategoryChange, onLoadError }: CategorySelectProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch('/api/categories');
        if (!response.ok) {
          throw new Error(`Failed to fetch categories: ${response.statusText}`);
        }
        const data: Category[] = await response.json();
        setCategories(data);
        onLoadError(null); // Clear error on success
      } catch (err) {
        let errorMessage = 'An unknown error occurred';
        if (err instanceof Error) {
          errorMessage = err.message;
        }
        setError(errorMessage);
        onLoadError(errorMessage); // Report error
        console.error("Error fetching categories:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [onLoadError]); // Added onLoadError to dependency array

  if (loading) {
    return (
      <Select disabled>
        <SelectTrigger className="w-full md:w-[200px]">
          <SelectValue placeholder="Loading categories..." />
        </SelectTrigger>
        <SelectContent />
      </Select>
    );
  }

  if (error) {
    return (
      <div className="text-red-500">
        Error loading categories: {error}. Please try refreshing.
      </div>
    );
  }

  return (
    <Select
      value={selectedCategory || 'all'}
      onValueChange={(value) => onCategoryChange(value === 'all' ? null : value)}
    >
      <SelectTrigger className="w-full md:w-[200px]">
        <SelectValue placeholder="Select category" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Categories</SelectItem>
        {categories.map((category) => (
          <SelectItem key={category.id} value={category.name}>
            {/* Capitalize first letter, handle empty or short names gracefully */}
            {category.name.charAt(0).toUpperCase() + category.name.slice(1)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}