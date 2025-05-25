import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { GalleryImage } from '@/pages/Gallery'; // Adjust path as necessary

interface ImageDetailModalProps {
  image: GalleryImage | null;
  onClose: () => void;
}

// Helper function to format date (e.g., "July 20, 2023, 10:00 AM")
const formatDate = (dateString: string): string => {
  if (!dateString || dateString === '0000-00-00 00:00:00') { // Handle invalid or default DB timestamp
    return 'Date not available';
  }
  try {
    const date = new Date(dateString);
    // Check if date is valid after parsing
    if (isNaN(date.getTime())) {
        // Try to parse as if it's UTC if it's not already explicitly so
        // The backend stores it as TEXT defaultNow() which is likely UTC.
        const utcDate = new Date(dateString.endsWith('Z') ? dateString : dateString + 'Z');
        if (isNaN(utcDate.getTime())) {
            return 'Invalid date';
        }
        return utcDate.toLocaleString(undefined, {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    }
    return date.toLocaleString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (e) {
    console.error("Error formatting date:", e);
    return "Invalid date";
  }
};


export default function ImageDetailModal({ image, onClose }: ImageDetailModalProps) {
  if (!image) {
    return null;
  }

  return (
    <Dialog open={!!image} onOpenChange={(isOpen) => { if (!isOpen) onClose(); }}>
      <DialogContent className="sm:max-w-[600px] md:max-w-[800px] lg:max-w-[1000px] xl:max-w-[1200px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Image Details</DialogTitle>
          <DialogDescription>
            Category: {image.category.charAt(0).toUpperCase() + image.category.slice(1)}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-grow overflow-y-auto p-1">
          <img 
            src={image.url} 
            alt={`Artwork from ${image.apiSource} - ${image.category}`} 
            className="max-w-full max-h-[60vh] object-contain mx-auto rounded-md" 
          />
        </div>

        <div className="mt-4 text-sm text-muted-foreground space-y-1 p-1">
          <p><strong>Source API:</strong> {image.apiSource}</p>
          <p><strong>Date Added:</strong> {formatDate(image.createdAt)}</p>
          {(image.width && image.height && image.width !== 0 && image.height !== 0) && (
            <p><strong>Dimensions:</strong> {image.width}w x {image.height}h</p>
          )}
        </div>

        <DialogFooter className="mt-auto pt-4">
          <DialogClose asChild>
            <Button type="button" variant="outline" onClick={onClose}>
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
