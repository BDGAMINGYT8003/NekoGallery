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
  const [downloadingIndex, setDownloadingIndex] = useState<number | null>(null);
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

  const handleDownload = async (imageUrl: string, index: number) => {
    try {
      setDownloadingIndex(index);
      setError(null);

      const response = await fetch(imageUrl, {
        mode: 'cors',
        headers: {
          'Accept': 'image/*'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`);
      }

      const contentType = response.headers.get('content-type');
      const extension = contentType?.split('/')[1] || 'jpg';
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `image-${Date.now()}.${extension}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading image:', error);
      setError('Failed to download image. Please try again.');
    } finally {
      setDownloadingIndex(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="p-4 md:p-8">
        <Card className="mb-8 bg-surface-container-low">
          <CardContent className="p-6">
            <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-primary to-tertiary bg-clip-text text-transparent">
              Neko Gallery
            </h1>
            <CategorySelect
              selectedCategory={selectedCategory}
              onCategoryChange={(category) => setSelectedCategory(category)}
            />
          </CardContent>
        </Card>

        {error && (
          <Card className="mb-4 bg-error-container text-on-error-container">
            <CardContent className="p-4">
              <p>{error}</p>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-4 md:px-8">
        {images.map((image, index) => (
          <Card
            key={`${image.url}-${index}`}
            className="relative w-full group overflow-hidden"
          >
            <CardContent className="p-2">
              <img
                src={image.url}
                alt="Artwork"
                className="w-full h-auto object-contain rounded-lg transition-transform duration-300 ease-in-out group-hover:scale-105"
                loading="lazy"
                onLoad={(e) => {
                  const img = e.target as HTMLImageElement;
                  img.style.aspectRatio = `${img.naturalWidth} / ${img.naturalHeight}`;
                }}
              />
            </CardContent>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-auto flex justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <Button
                variant="tertiary"
                size="sm"
                onClick={() => handleDownload(image.url, index)}
                disabled={downloadingIndex === index}
              >
                <Download className={`w-4 h-4 mr-2 ${downloadingIndex === index ? 'animate-bounce' : ''}`} />
                {downloadingIndex === index ? 'Downloading...' : 'Download'}
              </Button>
            </div>
          </Card>
        ))}

        {loading && (
          Array.from({ length: ITEMS_PER_PAGE }).map((_, index) => (
            <Card key={`skeleton-${index}`} className="w-full aspect-[3/4] animate-pulse bg-surface-container" />
          ))
        )}
      </div>

      <div ref={endRef} className="h-4" />
    </div>
  );
}