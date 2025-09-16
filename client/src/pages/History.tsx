import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { getHistory, clearHistory } from '../lib/historyDB';
import type { GalleryImage } from './Gallery';
import GalleryGrid from '../components/GalleryGrid';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Trash2 } from 'lucide-react';

export default function History() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHistory() {
      const historyImages = await getHistory();
      setImages(historyImages);
      setLoading(false);
    }
    loadHistory();
  }, []);

  const handleClearHistory = async () => {
    await clearHistory();
    setImages([]);
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center">
          <Button asChild variant="ghost" size="icon">
            <Link to="/">
              <ArrowLeft />
            </Link>
          </Button>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold ml-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Recently Viewed
          </h1>
        </div>
        {images.length > 0 && (
          <Button variant="destructive" onClick={handleClearHistory}>
            <Trash2 className="mr-2 h-4 w-4" /> Clear History
          </Button>
        )}
      </div>

      {images.length > 0 ? (
        <GalleryGrid
          images={images}
          loading={loading}
        />
      ) : (
        !loading && (
          <div className="text-center text-muted-foreground mt-16">
            <p className="text-xl">No recently viewed images.</p>
            <p>Go back to the gallery and view some images to see them here.</p>
            <Button asChild className="mt-4">
              <Link to="/">Back to Gallery</Link>
            </Button>
          </div>
        )
      )}
    </div>
  );
}
