import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { getHistoryItems, clearHistory, HistoryItem } from '@/lib/history';
import { GalleryImage } from '@/pages/Gallery';

interface HistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImageClick: (image: GalleryImage) => void;
}

export default function HistoryDialog({ open, onOpenChange, onImageClick }: HistoryDialogProps) {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [maxItems, setMaxItems] = useState(() => {
    return localStorage.getItem('maxHistoryItems') || '50';
  });

  useEffect(() => {
    if (open) {
      getHistoryItems().then(setHistory);
    }
  }, [open]);

  const handleClearHistory = async () => {
    await clearHistory();
    setHistory([]);
  };

  const handleMaxItemsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMaxItems(value);
    localStorage.setItem('maxHistoryItems', value);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Recently Viewed</DialogTitle>
          <DialogDescription>
            Here are the images you've recently viewed.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 max-h-[60vh] overflow-y-auto p-4">
          {history.map((item) => (
            <div
              key={item.url}
              className="group relative cursor-pointer"
              onClick={() => onImageClick(item)}
            >
              <img
                src={item.url}
                alt="history item"
                className="w-full h-full object-cover rounded-lg transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <p className="text-white text-center p-2">View</p>
              </div>
            </div>
          ))}
          {history.length === 0 && (
            <p className="col-span-full text-center text-muted-foreground">
              No history yet.
            </p>
          )}
        </div>
        <DialogFooter className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Label htmlFor="max-history-items">Max History</Label>
            <Input
              id="max-history-items"
              type="number"
              value={maxItems}
              onChange={handleMaxItemsChange}
              className="w-24"
            />
          </div>
          <Button variant="outline" onClick={handleClearHistory}>
            Clear History
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
