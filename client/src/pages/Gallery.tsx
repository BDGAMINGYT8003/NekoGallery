import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Download, Share2, ZoomIn, ZoomOut, History } from 'lucide-react';
import CategorySelect from '../components/CategorySelect';
import ImageCard from '@/components/ImageCard';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { useIsMobile } from '@/hooks/use-mobile';
import { useSwipeNavigation } from '@/hooks/use-swipe-navigation';
import { useFullscreen } from '@/hooks/use-fullscreen';
import { useHistory } from '@/hooks/use-history';
import HistoryDrawer from '@/components/HistoryDrawer';
import { saveAs } from 'file-saver';

export interface GalleryImage {
  id: string;
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
  const [showUI, setShowUI] = useState(false);
  const loadingRef = useRef(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const { currentIndex, setCurrentIndex, x, opacity, onDragEnd } = useSwipeNavigation(images.length, fetchImages);
  const { isFullscreen, toggleFullscreen } = useFullscreen();
  const { historyOpen, setHistoryOpen } = useHistory(images[currentIndex]);


  const fetchImages = useCallback(async (initial = false) => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    if(!initial) setLoading(true);

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
    setCurrentIndex(0);
    fetchImages(true);
  }, [selectedCategory, fetchImages]);


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
    let id = '';

    if (apiSource === 'waifu_pics_api') {
      imageUrl = data.url;
      id = imageUrl; // Use URL as ID for this specific API as it seems unique
    } else if (apiSource === 'nekos_moe_api' && data.images?.[0]) {
      id = data.images[0].id;
      imageUrl = `https://nekos.moe/image/${id}.jpg`;
    } else {
      imageUrl = data.url_japan;
      id = imageUrl; // Use URL as ID for this specific API as it seems unique
    }

    return imageUrl ? { url: imageUrl, apiSource, category, id } : null;
  }

  const handleDownload = async (imageUrl: string, index: number) => {
    try {
      setDownloadingIndex(index);
      setError(null);

      const response = await fetch(`/api/download?url=${encodeURIComponent(imageUrl)}`);

      if (!response.ok) {
        throw new Error(`Failed to download image: ${response.statusText}`);
      }

      const blob = await response.blob();
      const contentDisposition = response.headers.get('content-disposition');
      let filename = `image-${Date.now()}.jpg`;
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch && filenameMatch.length > 1) {
          filename = filenameMatch[1];
        }
      }

      saveAs(blob, filename);

      toast({
        title: "Download Started",
        description: "Your image is downloading.",
      });
    } catch (error) {
      console.error('Error downloading image:', error);
      setError('Failed to download image. Please try again.');
      toast({
        title: "Download Failed",
        description: "Could not download the image.",
        variant: "destructive",
      });
    } finally {
      setDownloadingIndex(null);
    }
  };


  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') {
        setCurrentIndex((prev) => Math.min(prev + 1, images.length - 1));
      } else if (event.key === 'ArrowLeft') {
        setCurrentIndex((prev) => Math.max(prev - 1, 0));
      } else if (event.key === 'f') {
        toggleFullscreen();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [images.length, setCurrentIndex, toggleFullscreen]);

  useEffect(() => {
    // Preload next 2 images
    const preloadNextImages = () => {
      if (images.length > currentIndex + 1) {
        const nextImage1 = new Image();
        nextImage1.src = images[currentIndex + 1].url;
      }
      if (images.length > currentIndex + 2) {
        const nextImage2 = new Image();
        nextImage2.src = images[currentIndex + 2].url;
      }
    };
    preloadNextImages();
  }, [currentIndex, images]);

  if (!images.length && loading) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-background">
        <div className="w-full h-full bg-muted animate-pulse" />
      </div>
    );
  }


  const handleShare = async () => {
    const image = images[currentIndex];
    if (navigator.share && image) {
      try {
        await navigator.share({
          title: 'Check out this image!',
          text: `Here is an image from Neko Gallery.`,
          url: image.url,
        });
        toast({
            title: "Shared successfully!",
            description: "The image was shared.",
        });
      } catch (error) {
        console.error('Error sharing:', error);
        toast({
            title: "Sharing failed",
            description: "Could not share the image.",
            variant: "destructive",
        });
      }
    } else {
        toast({
            title: "Sharing not supported",
            description: "Your browser does not support the Web Share API.",
            variant: "destructive",
        });
    }
  };

  const currentImage = images[currentIndex];

  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center bg-black overflow-hidden relative group" onClick={() => isMobile && setShowUI(prev => !prev)}>
      <AnimatePresence>
        { (showUI || !isMobile) &&
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute top-4 left-4 z-20">
            <CategorySelect
              selectedCategory={selectedCategory}
              onCategoryChange={(category) => {
                setSelectedCategory(category);
              }}
            />
          </motion.div>
        }
      </AnimatePresence>
       <AnimatePresence>
        { (showUI || !isMobile) &&
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute top-4 right-4 z-20 flex gap-2">
              <Button variant="ghost" size="icon" onClick={() => setHistoryOpen(true)} aria-label="View history">
                  <History className="h-6 w-6 text-white" />
              </Button>
          </motion.div>
        }
      </AnimatePresence>

      <AnimatePresence initial={false}>
        <motion.div
          key={currentIndex}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          onDragEnd={onDragEnd}
          style={{ x, opacity }}
          className="w-full h-full flex items-center justify-center"
          initial={{ x: 300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -300, opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {currentImage && (
            <ImageCard image={currentImage} />
          )}
        </motion.div>
      </AnimatePresence>

      <div className={`absolute bottom-0 left-0 right-0 p-4 z-10
                      transition-opacity duration-300
                      ${isMobile ? (showUI ? 'opacity-100' : 'opacity-0') : 'opacity-0 group-hover:opacity-100'}`}>
        <div className="flex justify-center items-center gap-4 bg-gradient-to-t from-black/50 to-transparent pt-4">
            <Button
                variant="outline"
                size="lg"
                className="bg-black/50 text-white border-white/20"
                onClick={() => currentImage && handleDownload(currentImage.url, currentIndex)}
                disabled={downloadingIndex === currentIndex}
            >
                <Download className="w-5 h-5 mr-2" />
                {downloadingIndex === currentIndex ? 'Downloading...' : 'Download'}
            </Button>
            {navigator.share && (
                <Button variant="outline" size="icon" className="bg-black/50 text-white border-white/20" onClick={handleShare} aria-label="Share image">
                    <Share2 className="h-6 w-6" />
                </Button>
            )}
            <Button variant="outline" size="icon" className="bg-black/50 text-white border-white/20" onClick={toggleFullscreen} aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}>
                {isFullscreen ? <ZoomOut className="h-6 w-6" /> : <ZoomIn className="h-6 w-6" />}
            </Button>
        </div>
        <Progress value={(currentIndex + 1) / images.length * 100} className="w-full h-1 mt-4" />
      </div>

      <HistoryDrawer open={historyOpen} onOpenChange={setHistoryOpen} />
    </div>
  );
}