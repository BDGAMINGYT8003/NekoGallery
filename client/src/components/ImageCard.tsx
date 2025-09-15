import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import type { GalleryImage } from '../pages/Gallery';

interface ImageCardProps {
  image: GalleryImage;
  onDownload: (imageUrl: string) => void;
  isDownloading: boolean;
  onClick: () => void;
}

export default function ImageCard({ image, onDownload, isDownloading, onClick }: ImageCardProps) {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 },
      }}
      className="relative"
    >
      <Card className="group overflow-hidden" onClick={onClick}>
        <CardContent className="p-0">
          <div className="relative w-full">
            {isLoading && (
              <div className="absolute inset-0 bg-muted animate-pulse" />
            )}
            <img
              src={image.url}
              alt="Artwork"
              className={`w-full h-auto object-cover transition-transform duration-300 group-hover:scale-110 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
              loading="lazy"
              onLoad={(e) => {
                const img = e.target as HTMLImageElement;
                img.style.aspectRatio = `${img.naturalWidth} / ${img.naturalHeight}`;
                setIsLoading(false);
              }}
            />
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <motion.div
              className="absolute bottom-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              initial={{ y: 20 }}
              animate={{ y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Button
                variant="default"
                size="lg"
                className="bg-primary/80 backdrop-blur-sm text-primary-foreground hover:bg-primary"
                onClick={(e) => {
                  e.stopPropagation(); // prevent opening the fullscreen viewer
                  onDownload(image.url);
                }}
                disabled={isDownloading}
              >
                <Download className={`w-5 h-5 mr-2 ${isDownloading ? 'animate-bounce' : ''}`} />
                {isDownloading ? 'Downloading...' : 'Download'}
              </Button>
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
