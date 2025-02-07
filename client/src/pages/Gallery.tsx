import { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import CategorySelect from '../components/CategorySelect';
import { useIntersection } from '@/hooks/use-intersection';

export interface GalleryImage {
  url: string;
  apiSource: string;
  category: string | null;
  width?: number;
  height?: number;
}

const ITEMS_PER_PAGE = 10;

export default function Gallery() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const loadingRef = useRef(false);
  const endRef = useRef<HTMLDivElement>(null);

  const isIntersecting = useIntersection(endRef, {
    root: null,
    rootMargin: '100px',
    threshold: 0.1,
  });

  const fetchImages = useCallback(async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);

    try {
      const newImages: GalleryImage[] = [];

      for (let i = 0; i < ITEMS_PER_PAGE; i++) {
        let apiSource: string;
        let category = selectedCategory;

        if (!selectedCategory) {
          const apiSources = ['nsfw_api', 'waifu_pics_api', 'nekos_moe_api'];
          apiSource = apiSources[Math.floor(Math.random() * apiSources.length)];

          if (apiSource === 'waifu_pics_api') {
            const waifuCategories = ["waifu", "neko", "blowjob"];
            category = `waifu_${waifuCategories[Math.floor(Math.random() * waifuCategories.length)]}`;
          } else if (apiSource === 'nsfw_api') {
            const nsfwCategories = [
              "anal", "ass", "blowjob", "breeding", "buttplug", "cages",
              "ecchi", "feet", "fo", "gif", "hentai", "legs",
              "masturbation", "milf", "neko", "paizuri", "petgirls",
              "pierced", "selfie", "smothering", "socks", "vagina", "yuri"
            ];
            category = nsfwCategories[Math.floor(Math.random() * nsfwCategories.length)];
          }
        } else {
          apiSource = 'nsfw_api';
        }

        try {
          const imageData = await fetchImageFromApi(apiSource, category);
          if (imageData) {
            newImages.push(imageData);
          }
        } catch (error) {
          console.error('Error fetching image:', error);
          continue;
        }
      }

      setImages(prev => [...prev, ...newImages]);
      setError(null);
    } catch (error) {
      setError('Failed to load images. Please try again.');
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [selectedCategory]);

  useEffect(() => {
    setImages([]);
    fetchImages();
  }, [selectedCategory, fetchImages]);

  useEffect(() => {
    if (isIntersecting) {
      fetchImages();
    }
  }, [isIntersecting, fetchImages]);

  async function fetchImageFromApi(apiSource: string, category: string | null): Promise<GalleryImage | null> {
    const apiEndpoints = {
      nsfw_api: 'https://api.n-sfw.com/nsfw/',
      waifu_pics_api: 'https://api.waifu.pics/nsfw/',
      nekos_moe_api: 'https://nekos.moe/api/v1/random/image'
    };

    const endpoint = category?.startsWith('waifu_')
      ? `${apiEndpoints.waifu_pics_api}${category.replace('waifu_', '')}`
      : category
        ? `${apiEndpoints[apiSource as keyof typeof apiEndpoints]}${category}`
        : apiEndpoints[apiSource as keyof typeof apiEndpoints];

    const response = await fetch(endpoint);
    if (!response.ok) return null;

    const data = await response.json();
    let imageUrl = '';

    if (apiSource === 'waifu_pics_api') {
      imageUrl = data.url;
    } else if (apiSource === 'nekos_moe_api' && data.images?.[0]) {
      imageUrl = `https://nekos.moe/image/${data.images[0].id}.jpg`;
    } else {
      imageUrl = data.url_japan;
    }

    return imageUrl ? { url: imageUrl, apiSource, category } : null;
  }

  const handleDownload = async (imageUrl: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `image-${Date.now()}.${blob.type.split('/')[1]}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading image:', error);
      setError('Failed to download image. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <Card className="mb-8">
        <CardContent className="p-6">
          <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
            Neko Gallery
          </h1>
          <CategorySelect
            selectedCategory={selectedCategory}
            onCategoryChange={(category) => setSelectedCategory(category)}
          />
        </CardContent>
      </Card>

      {error && (
        <div className="text-red-500 mb-4 p-4 bg-red-100 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {images.map((image, index) => (
          <div
            key={`${image.url}-${index}`}
            className="relative w-full group"
          >
            <div className="relative w-full">
              <img
                src={image.url}
                alt="Artwork"
                className="w-full h-auto object-contain rounded-lg transition-transform duration-200 group-hover:scale-[1.02]"
                loading="lazy"
                onLoad={(e) => {
                  const img = e.target as HTMLImageElement;
                  const aspectRatio = img.naturalHeight / img.naturalWidth;
                  img.style.aspectRatio = `${img.naturalWidth} / ${img.naturalHeight}`;
                }}
              />
              <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/50 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex justify-center rounded-b-lg">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:text-primary hover:bg-white/20"
                  onClick={() => handleDownload(image.url)}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          </div>
        ))}

        {loading && (
          Array.from({ length: ITEMS_PER_PAGE }).map((_, index) => (
            <div
              key={`skeleton-${index}`}
              className="relative w-full aspect-square bg-muted animate-pulse rounded-lg"
            />
          ))
        )}
      </div>

      <div ref={endRef} className="h-4" />
    </div>
  );
}