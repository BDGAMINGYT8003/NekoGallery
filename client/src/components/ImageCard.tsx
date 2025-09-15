import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Share2 } from 'lucide-react';
import type { GalleryImage } from '../pages/Gallery';
import { useToast } from '@/hooks/use-toast';

interface ImageCardProps {
  image: GalleryImage;
  index: number;
  handleDownload: (imageUrl: string, index: number) => void;
  downloadingIndex: number | null;
  onClick: () => void;
}

export default function ImageCard({ image, index, handleDownload, downloadingIndex, onClick }: ImageCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { toast } = useToast();

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Check out this image!',
          url: image.url,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      try {
        await navigator.clipboard.writeText(image.url);
        toast({
          title: 'Copied to clipboard!',
          description: 'Image URL has been copied to your clipboard.',
        });
      } catch (error) {
        console.error('Error copying to clipboard:', error);
        toast({
          title: 'Error',
          description: 'Failed to copy URL to clipboard.',
          variant: 'destructive',
        });
      }
    }
  };

  const handleDownloadClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleDownload(image.url, index);
  };

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 },
      }}
      onClick={onClick}
      className="cursor-pointer"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Card className="group overflow-hidden relative">
        <CardContent className="p-0">
          <img
            src={image.url}
            alt="Artwork"
            className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-110"
            loading="lazy"
            onLoad={(e) => {
              const img = e.target as HTMLImageElement;
              img.style.aspectRatio = `${img.naturalWidth} / ${img.naturalHeight}`;
            }}
          />
          <div
            className="absolute inset-0 bg-black/20 transition-opacity duration-300"
            style={{ opacity: isHovered ? 1 : 0 }}
          />
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
            <motion.div
              className="flex gap-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 20 }}
              transition={{ delay: 0.1 }}
            >
              <Button
                variant="default"
                size="lg"
                className="bg-primary/80 backdrop-blur-sm text-primary-foreground hover:bg-primary"
                onClick={handleDownloadClick}
                disabled={downloadingIndex === index}
              >
                <Download className={`w-5 h-5 mr-2 ${downloadingIndex === index ? 'animate-bounce' : ''}`} />
                {downloadingIndex === index ? 'Downloading...' : 'Download'}
              </Button>
              <Button
                variant="secondary"
                size="lg"
                className="bg-secondary/80 backdrop-blur-sm text-secondary-foreground hover:bg-secondary"
                onClick={handleShare}
              >
                <Share2 className="w-5 h-5" />
              </Button>
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
