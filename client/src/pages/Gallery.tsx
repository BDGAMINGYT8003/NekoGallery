import { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, GalleryVerticalEnd } from 'lucide-react';
import CategorySelect from '../components/CategorySelect';
import { useIntersection } from '@/hooks/use-intersection';
import { motion } from 'framer-motion';

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
    rootMargin: '200px',
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 10,
      },
    },
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 md:p-8">
      <header className="mb-8">
        <Card className="bg-surface-container border-border/50 rounded-xl shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <GalleryVerticalEnd className="w-8 h-8 text-primary" />
              <h1 className="text-display-sm bg-gradient-to-r from-primary via-tertiary to-secondary bg-clip-text text-transparent">
                Neko Gallery
              </h1>
            </div>
            <p className="text-body-lg text-muted-foreground mt-2">An expressive gallery built with Material 3.</p>
            <div className="mt-6">
              <CategorySelect
                selectedCategory={selectedCategory}
                onCategoryChange={(category) => setSelectedCategory(category)}
              />
            </div>
          </CardContent>
        </Card>
      </header>

      {error && (
        <div className="mb-4 p-4 bg-destructive/20 text-destructive-foreground rounded-lg border border-destructive/50">
          {error}
        </div>
      )}

      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {images.map((image, index) => (
          <motion.div key={`${image.url}-${index}`} variants={itemVariants}>
            <Card className="group relative w-full overflow-hidden rounded-lg bg-surface-container-low border-border/50 shadow-md transition-all duration-300 ease-in-out hover:shadow-xl hover:border-primary/50">
              <img
                src={image.url}
                alt="Artwork"
                className="w-full h-auto object-contain transition-transform duration-300 ease-in-out group-hover:scale-105"
                loading="lazy"
                onLoad={(e) => {
                  const img = e.target as HTMLImageElement;
                  // Only set aspect ratio if it hasn't been set, to avoid flicker
                  if (!img.style.aspectRatio) {
                    img.style.aspectRatio = `${img.naturalWidth} / ${img.naturalHeight}`;
                  }
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute bottom-0 left-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex justify-center">
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full text-label-lg"
                  onClick={() => handleDownload(image.url, index)}
                  disabled={downloadingIndex === index}
                >
                  <Download className={`w-4 h-4 mr-2 ${downloadingIndex === index ? 'animate-bounce' : ''}`} />
                  {downloadingIndex === index ? 'Downloading...' : 'Download'}
                </Button>
              </div>
            </Card>
          </motion.div>
        ))}

        {loading &&
          Array.from({ length: ITEMS_PER_PAGE }).map((_, index) => (
            <Card
              key={`skeleton-${index}`}
              className="w-full bg-surface-container-low border-border/50 rounded-lg shadow-md animate-pulse"
              style={{ aspectRatio: '1 / 1.2' }} // Skeletons can have a fixed aspect ratio
            />
          ))}
      </motion.div>

      <div ref={endRef} className="h-4" />
    </div>
  );
}