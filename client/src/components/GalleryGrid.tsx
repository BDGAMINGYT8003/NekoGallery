import { useEffect, useRef, useCallback } from 'react';
import ImageCard from './ImageCard';
import LoadingPlaceholder from './LoadingPlaceholder';
import type { GalleryImage } from '../pages/Gallery';
import { useIntersection } from '@/hooks/use-intersection';

interface GalleryGridProps {
  images: GalleryImage[];
  loading: boolean;
  onLoadMore?: () => void;
}

export default function GalleryGrid({ images, loading, onLoadMore }: GalleryGridProps) {
  const endRef = useRef<HTMLDivElement>(null);
  const isIntersecting = useIntersection(endRef, {
    root: null,
    rootMargin: '100px',
    threshold: 0.1,
  });

  useEffect(() => {
    if (isIntersecting && !loading && onLoadMore) {
      onLoadMore();
    }
  }, [isIntersecting, loading, onLoadMore]);

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((image, index) => (
          <ImageCard key={`${image.url}-${index}`} image={image} />
        ))}
      </div>

      <div ref={endRef} className="mt-8">
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <LoadingPlaceholder key={index} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
