import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Eye } from 'lucide-react';
import type { GalleryImage } from '@/pages/Gallery'; // Adjust path if GalleryImage is moved

interface ImageCardProps {
  image: GalleryImage;
  index: number; 
  onOpenModal: (image: GalleryImage) => void;
  onDownload: (imageUrl: string, index: number) => void;
  isDownloadingThis: boolean; // Renamed for clarity, specific to this card's download state
}

export default function ImageCard({ image, index, onOpenModal, onDownload, isDownloadingThis }: ImageCardProps) {
  return (
    <Card 
      className="relative w-full group overflow-hidden rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 cursor-pointer"
      onClick={() => onOpenModal(image)}
    >
      <CardContent className="p-0 aspect-[3/4]"> {/* Enforces consistent aspect ratio */}
        <img
          src={image.url}
          alt={`Artwork from ${image.apiSource} - ${image.category}`}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        <div 
          className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-4"
          aria-hidden="true" 
        >
          <div className="flex justify-center items-center flex-grow"> {/* For centering the Eye icon */}
            <Eye className="w-12 h-12 text-white opacity-80 transform transition-transform duration-300 group-hover:scale-110" />
          </div>
          <div className="flex justify-between items-center"> {/* Container for category and download button */}
              <h3 className="text-sm font-semibold text-white truncate" title={image.category}>
                {image.category.charAt(0).toUpperCase() + image.category.slice(1)}
              </h3>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:text-primary hover:bg-white/20 w-9 h-9 rounded-full backdrop-blur-sm bg-black/20" // Adjusted styling
                onClick={(e) => {
                  e.stopPropagation(); // Prevent Card's onClick from firing
                  onDownload(image.url, index);
                }}
                disabled={isDownloadingThis}
                title="Download image"
              >
                <Download className={`w-4 h-4 ${isDownloadingThis ? 'animate-bounce' : ''}`} />
              </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
