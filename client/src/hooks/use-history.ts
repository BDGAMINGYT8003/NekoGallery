import { useState, useEffect } from 'react';
import { addToHistory } from '@/lib/indexedDB';
import type { GalleryImage } from '@/pages/Gallery';

export function useHistory(image: GalleryImage | undefined) {
  const [historyOpen, setHistoryOpen] = useState(false);

  useEffect(() => {
    if (image) {
      addToHistory(image);
    }
  }, [image]);

  return { historyOpen, setHistoryOpen };
}
