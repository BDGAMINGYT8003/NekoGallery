import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import type { GalleryImage } from '../pages/Gallery';
import { addImageToHistory } from '../lib/historyDB';

interface FullscreenViewerProps {
  image: GalleryImage | null;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

export default function FullscreenViewer({ image, onClose, onPrev, onNext }: FullscreenViewerProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleSwipe = (event: MouseEvent | TouchEvent | PointerEvent, info: { offset: { x: number; y: number; }; velocity: { x: number; y: number; }; }) => {
    if (info.offset.x > 100) {
      onPrev();
    } else if (info.offset.x < -100) {
      onNext();
    }
  };

  useEffect(() => {
    if (image) {
      addImageToHistory(image);
    }
  }, [image]);

  return (
    <AnimatePresence>
      {image && (
        <motion.div
          className="fixed inset-0 bg-black/80 backdrop-blur-lg z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => {
            if (!isDragging) {
              onClose();
            }
          }}
        >
          <motion.img
            key={image.url}
            src={image.url}
            alt="Fullscreen Artwork"
            className="max-h-[90vh] max-w-[90vw] object-contain"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            onDragStart={() => setIsDragging(true)}
            onDragEnd={(event, info) => {
              handleSwipe(event, info);
              // A brief delay to prevent the click from registering immediately
              setTimeout(() => setIsDragging(false), 50);
            }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking the image
          />
          <button
            className="absolute top-4 right-4 text-white/80 hover:text-white"
            onClick={onClose}
          >
            <X size={32} />
          </button>
          <button
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white"
            onClick={onPrev}
          >
            &lt;
          </button>
          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white"
            onClick={onNext}
          >
            &gt;
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
