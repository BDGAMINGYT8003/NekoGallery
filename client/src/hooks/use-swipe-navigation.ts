import { useState } from 'react';
import { useMotionValue, useTransform } from 'framer-motion';
import { useIsMobile } from './use-mobile';
import { triggerHapticFeedback } from '@/lib/haptics';

export function useSwipeNavigation(imageCount: number) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const isMobile = useIsMobile();

  const x = useMotionValue(0);
  const opacity = useTransform(x, [-200, 0, 200], [0.5, 1, 0.5]);

  const onDragEnd = (event: any, info: any) => {
    if (info.offset.x < -100) {
      setCurrentIndex((prev) => Math.min(prev + 1, imageCount - 1));
      if (isMobile) triggerHapticFeedback();
    } else if (info.offset.x > 100) {
      setCurrentIndex((prev) => Math.max(prev - 1, 0));
      if (isMobile) triggerHapticFeedback();
    }
  };

  return {
    currentIndex,
    setCurrentIndex,
    x,
    opacity,
    onDragEnd,
  };
}
