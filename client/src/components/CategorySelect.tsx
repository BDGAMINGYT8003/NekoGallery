import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Palette } from 'lucide-react';

const CATEGORIES = [
  "anal", "ass", "blowjob", "breeding", "buttplug", "cages",
  "ecchi", "feet", "fo", "gif", "hentai", "legs",
  "masturbation", "milf", "neko", "paizuri", "petgirls",
  "pierced", "selfie", "smothering", "socks", "vagina", "yuri"
];

interface CategorySelectProps {
  selectedCategory: string | null;
  onCategoryChange: (category: string | null) => void;
}

export default function CategorySelect({ selectedCategory, onCategoryChange }: CategorySelectProps) {
  return (
    <div className="relative w-full md:w-auto md:min-w-[280px]">
      <Palette className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
      <Select
        value={selectedCategory || 'all'}
        onValueChange={(value) => onCategoryChange(value === 'all' ? null : value)}
      >
        <SelectTrigger className="w-full bg-surface-container-high border-border/60 rounded-lg pl-10 transition-colors focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background">
          <SelectValue placeholder="Select a category..." />
        </SelectTrigger>
        <SelectContent className="bg-surface-container-high border-border/60 rounded-xl">
          <SelectItem value="all">All Categories</SelectItem>
          {CATEGORIES.map((category) => (
            <SelectItem key={category} value={category} className="rounded-md">
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}