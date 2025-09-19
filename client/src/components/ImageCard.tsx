import { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import type { GalleryImage } from '../pages/Gallery';
import { useIntersection } from '@/hooks/use-intersection';
import { addImageToHistory } from '../lib/historyDB';

interface ImageCardProps {
  image: GalleryImage;
}

export default function ImageCard({ image }: ImageCardProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [naturalSize, setNaturalSize] = useState<{ width: number; height: number } | null>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const isVisible = useIntersection(cardRef, {
    threshold: 0.01, // Trigger when 1% of the card is visible
    freezeOnceVisible: true,
  });

  useEffect(() => {
    if (isVisible) {
      addImageToHistory(image);
    }
  }, [isVisible, image]);

  const handleImageLoad = () => {
    setIsLoading(false);
    setError(false);
    if (imageRef.current) {
      setNaturalSize({
        width: imageRef.current.naturalWidth,
        height: imageRef.current.naturalHeight
      });
    }
  };

  const handleImageError = () => {
    setIsLoading(false);
    setError(true);
  };

  const aspectRatio = naturalSize
    ? `${naturalSize.width} / ${naturalSize.height}`
    : '1 / 1';

  return (
    <div ref={cardRef}>
      <Card className="overflow-hidden bg-background/50 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02]">
        <div
          className="relative w-full"
          style={{ aspectRatio }}
        >
          {isLoading && (
            <div className="absolute inset-0 bg-muted animate-pulse" />
          )}

          {error ? (
            <div className="absolute inset-0 flex items-center justify-center bg-muted text-muted-foreground">
              Failed to load image
            </div>
          ) : (
            <img
              ref={imageRef}
              src={image.url}
              alt="Gallery"
              className={`w-full h-full object-contain transition-opacity duration-300 ${
                isLoading ? 'opacity-0' : 'opacity-100'
              }`}
              onLoad={handleImageLoad}
              onError={handleImageError}
              loading="lazy"
            />
          )}
        </div>
      </Card>
    </div>
  );
}
