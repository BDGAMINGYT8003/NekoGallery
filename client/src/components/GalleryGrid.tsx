import { useEffect, useRef, useCallback } from 'react';
import ImageCard from './ImageCard';
import LoadingPlaceholder from './LoadingPlaceholder';
import type { GalleryImage } from '../pages/Gallery';

interface GalleryGridProps {
  images: GalleryImage[];
  loading: boolean;
  onLoadMore: () => void;
}

export default function GalleryGrid({ images, loading, onLoadMore }: GalleryGridProps) {
  const observerRef = useRef<IntersectionObserver>();
  const loadingRef = useRef<HTMLDivElement>(null);

  const handleObserver = useCallback((entries: IntersectionObserverEntry[]) => {
    const target = entries[0];
    if (target.isIntersecting && !loading) {
      onLoadMore();
    }
  }, [loading, onLoadMore]);

  useEffect(() => {
    const options = {
      root: null,
      rootMargin: '20px',
      threshold: 0.1
    };

    observerRef.current = new IntersectionObserver(handleObserver, options);

    if (loadingRef.current) {
      observerRef.current.observe(loadingRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [handleObserver]);

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((image, index) => (
          <ImageCard key={`${image.url}-${index}`} image={image} />
        ))}
      </div>

      <div ref={loadingRef} className="mt-8">
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
