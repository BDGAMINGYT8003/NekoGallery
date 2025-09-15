import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { GalleryImage } from '@/pages/Gallery';
import { addHistoryItem } from '@/lib/history';

interface FullScreenViewerProps {
  images: GalleryImage[];
  activeIndex: number;
  onClose: () => void;
  setActiveIndex: (index: number) => void;
}

const FullScreenViewer = ({ images, activeIndex, onClose, setActiveIndex }: FullScreenViewerProps) => {
  useEffect(() => {
    if (images[activeIndex]) {
      addHistoryItem(images[activeIndex]);
    }
  }, [activeIndex, images]);

  const handleSwipe = (direction: 'left' | 'right') => {
    let newIndex;
    if (direction === 'left') {
      newIndex = activeIndex === images.length - 1 ? 0 : activeIndex + 1;
    } else {
      newIndex = activeIndex === 0 ? images.length - 1 : activeIndex - 1;
    }
    setActiveIndex(newIndex);
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-lg flex items-center justify-center z-50"
        onClick={onClose}
      >
        <motion.div
          className="relative w-full h-full flex items-center justify-center"
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          onDragEnd={(_, info) => {
            if (info.offset.x > 100) {
              handleSwipe('right');
            } else if (info.offset.x < -100) {
              handleSwipe('left');
            }
          }}
        >
          <AnimatePresence initial={false}>
            <motion.img
              key={activeIndex}
              src={images[activeIndex].url}
              alt="Full screen artwork"
              className="max-h-[90vh] max-w-[90vw] object-contain"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
            />
          </AnimatePresence>
        </motion.div>

        <button
          className="absolute top-4 right-4 text-white/80 hover:text-white"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
        >
          <X size={32} />
        </button>

        <button
          className="absolute left-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white"
          onClick={(e) => {
            e.stopPropagation();
            handleSwipe('right');
          }}
        >
          <ChevronLeft size={48} />
        </button>

        <button
          className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white"
          onClick={(e) => {
            e.stopPropagation();
            handleSwipe('left');
          }}
        >
          <ChevronRight size={48} />
        </button>
      </motion.div>
    </AnimatePresence>
  );
};

export default FullScreenViewer;
