import { useState, useEffect } from 'react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getHistory, clearHistory } from '@/lib/indexedDB';
import type { GalleryImage } from '@/pages/Gallery';
import { Trash2 } from 'lucide-react';

interface HistoryDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function HistoryDrawer({ open, onOpenChange }: HistoryDrawerProps) {
  const [history, setHistory] = useState<(GalleryImage & { timestamp: number })[]>([]);

  useEffect(() => {
    if (open) {
      const fetchHistory = async () => {
        const items = await getHistory();
        setHistory(items);
      };
      fetchHistory();
    }
  }, [open]);

  const handleClearHistory = async () => {
    await clearHistory();
    setHistory([]);
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="h-[80vh] bg-background border-t border-border">
        <DrawerHeader className="text-left">
          <DrawerTitle>Recently Viewed</DrawerTitle>
          <DrawerDescription>
            Here are the images you've recently viewed.
          </DrawerDescription>
        </DrawerHeader>
        <ScrollArea className="flex-grow p-4">
          {history.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {history.map((item) => (
                <div key={item.id} className="aspect-square bg-muted rounded-lg overflow-hidden">
                  <img
                    src={item.url}
                    alt="History item"
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <p>Your history is empty.</p>
            </div>
          )}
        </ScrollArea>
        <DrawerFooter>
          <Button variant="destructive" onClick={handleClearHistory} disabled={history.length === 0}>
            <Trash2 className="w-4 h-4 mr-2" />
            Clear History
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
