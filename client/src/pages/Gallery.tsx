import { useState, useEffect, useRef } from 'react';
import GalleryGrid from '../components/GalleryGrid';
import CategorySelect from '../components/CategorySelect';
import { Card, CardContent } from '@/components/ui/card';

export interface GalleryImage {
  url: string;
  apiSource: string;
  category: string | null;
}

const ITEMS_PER_PAGE = 10;

export default function Gallery() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const loadingRef = useRef(false);

  const fetchImages = async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);

    try {
      const newImages: GalleryImage[] = [];

      for (let i = 0; i < ITEMS_PER_PAGE; i++) {
        let apiSource: string;
        let category = selectedCategory;

        // If no category is selected, use random API and category
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
          // If category is selected, only use nsfw_api
          apiSource = 'nsfw_api';
        }

        const apiEndpoints = {
          nsfw_api: 'https://api.n-sfw.com/nsfw/',
          waifu_pics_api: 'https://api.waifu.pics/nsfw/',
          nekos_moe_api: 'https://nekos.moe/api/v1/random/image'
        };

        let imageUrl = '';
        try {
          const endpoint = category?.startsWith('waifu_') 
            ? `${apiEndpoints.waifu_pics_api}${category.replace('waifu_', '')}`
            : category 
              ? `${apiEndpoints[apiSource as keyof typeof apiEndpoints]}${category}`
              : apiEndpoints[apiSource as keyof typeof apiEndpoints];

          const response = await fetch(endpoint);

          if (!response.ok) continue;

          const data = await response.json();
          if (apiSource === 'waifu_pics_api') {
            imageUrl = data.url;
          } else if (apiSource === 'nekos_moe_api' && data.images?.[0]) {
            imageUrl = `https://nekos.moe/image/${data.images[0].id}.jpg`;
          } else {
            imageUrl = data.url_japan;
          }

          if (imageUrl) {
            newImages.push({ url: imageUrl, apiSource, category });
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
  };

  useEffect(() => {
    setImages([]);
    fetchImages();
  }, [selectedCategory]);

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

      <GalleryGrid
        images={images}
        loading={loading}
        onLoadMore={fetchImages}
      />
    </div>
  );
}