import { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Eye } from 'lucide-react';
import CategorySelect from '../components/CategorySelect';
import ImageDetailModal from '../components/ImageDetailModal';
import ImageCard from '../components/ImageCard';
import SkeletonGrid from '../components/SkeletonGrid';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'; // Import Select for sorting
import { useIntersection } from '@/hooks/use-intersection';

export interface GalleryImage {
  id: number; // Added
  url: string;
  apiSource: string;
  category: string; // Changed from string | null, as backend should always assign one
  width?: number;
  height?: number;
  createdAt: string; // Added
}

const ITEMS_PER_PAGE = 10;

export default function Gallery() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null); // For image fetching errors
  const [downloadingIndex, setDownloadingIndex] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1); 
  const [hasMoreImages, setHasMoreImages] = useState(true); 
  const [selectedImageForModal, setSelectedImageForModal] = useState<GalleryImage | null>(null);
  const [categoryError, setCategoryError] = useState<string | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [sortBy, setSortBy] = useState("createdAt"); // Default sort by createdAt
  const [sortOrder, setSortOrder] = useState("desc"); // Default sort order descending
  
  const endRef = useRef<HTMLDivElement>(null);
  const isIntersecting = useIntersection(endRef, {
    root: null,
    rootMargin: '100px',
    threshold: 0.1,
  });

  const openModal = (image: GalleryImage) => {
    setSelectedImageForModal(image);
  };

  const closeModal = () => {
    setSelectedImageForModal(null);
  };

  const fetchImages = useCallback(async (isNewCategory: boolean = false) => {
    if (loading && !isNewCategory) return; 
    if (!hasMoreImages && !isNewCategory) return;

    setLoading(true);
    setError(null); // Clear previous image errors

    const pageToFetch = isNewCategory ? 1 : currentPage;

    try {
      let url = `/api/images?page=${pageToFetch}&limit=${ITEMS_PER_PAGE}&sortBy=${sortBy}&sortOrder=${sortOrder}`;
      if (selectedCategory) {
        url += `&category=${selectedCategory}`;
      }

      const response = await fetch(url);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to fetch images: ${response.statusText}`);
      }

      const newImages: GalleryImage[] = await response.json();

      if (isNewCategory) {
        setImages(newImages);
      } else {
        setImages(prev => [...prev, ...newImages]);
      }
      
      if (newImages.length < ITEMS_PER_PAGE) {
        setHasMoreImages(false);
      } else {
        setHasMoreImages(true);
      }

      if (!isNewCategory) {
        setCurrentPage(prev => prev + 1);
      } else {
        setCurrentPage(2); // Reset to page 2 for next scroll if it's a new category load
      }

    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred while fetching images.');
      }
      console.error('Error fetching images:', err);
    } finally {
      setLoading(false);
      if (pageToFetch === 1) { // Only set initialLoading to false after the first fetch attempt
        setInitialLoading(false);
      }
    }
  }, [selectedCategory, currentPage, hasMoreImages, loading, sortBy, sortOrder]); // Added sortBy and sortOrder

  // Effect for initial load and when selectedCategory changes
  useEffect(() => {
    setImages([]); 
    setCurrentPage(1); 
    setHasMoreImages(true);
    if (!categoryError) { 
        setInitialLoading(true); 
        fetchImages(true);
    } else {
        setInitialLoading(false); 
    }
  }, [selectedCategory, categoryError, sortBy, sortOrder]); // Added sortBy and sortOrder

  // Effect for infinite scrolling
  useEffect(() => {
    if (isIntersecting && !loading && hasMoreImages && !categoryError) { 
      fetchImages(false); 
    }
  }, [isIntersecting, loading, hasMoreImages, categoryError]);

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
    <div className="min-h-screen bg-background p-4 md:p-8">
      <Card className="mb-8 shadow-lg">
        <CardContent className="p-6">
          <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
            Neko Gallery
          </h1>
          <CategorySelect
            selectedCategory={selectedCategory}
            onCategoryChange={(category) => {
              setSelectedCategory(category);
            }}
            onLoadError={setCategoryError}
          />
          <div className="mt-4">
            <label htmlFor="sort-select" className="block text-sm font-medium text-muted-foreground mb-1">
              Sort by
            </label>
            <Select
              value={`${sortBy}-${sortOrder}`}
              onValueChange={(value) => {
                const [newSortBy, newSortOrder] = value.split('-');
                setSortBy(newSortBy);
                setSortOrder(newSortOrder);
              }}
            >
              <SelectTrigger className="w-full md:w-[200px]" id="sort-select">
                <SelectValue placeholder="Sort images" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt-desc">Newest First</SelectItem>
                <SelectItem value="createdAt-asc">Oldest First</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {initialLoading && !categoryError && (
        <div className="flex flex-col items-center justify-center h-64">
          <svg className="animate-spin h-10 w-10 text-primary mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-lg text-muted-foreground">Loading Gallery...</p>
        </div>
      )}

      {categoryError && (
        <div className="text-center p-10">
          <h2 className="text-xl font-semibold text-destructive mb-4">Failed to load categories.</h2>
          <p className="text-muted-foreground mb-4">{categoryError}</p>
          <Button onClick={() => window.location.reload()}>Retry Page Load</Button>
        </div>
      )}

      {!categoryError && (
        <>
          {error && !initialLoading && (
            <div className="text-center p-10">
              <h2 className="text-xl font-semibold text-destructive mb-4">Failed to load images.</h2>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={() => fetchImages(true)}>Retry Fetching Images</Button>
            </div>
          )}

          {!initialLoading && !loading && !error && images.length === 0 && (
            <div className="text-center p-10">
              <h2 className="text-xl font-semibold text-muted-foreground">No images found.</h2>
              <p>Try selecting a different category or checking back later.</p>
            </div>
          )}

          {(!initialLoading || images.length > 0 || loading) && images.length > 0 && !error && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {images.map((image, index) => (
                <ImageCard
                  key={image.id || `${image.url}-${index}`}
                  image={image}
                  index={index}
                  onOpenModal={openModal}
                  onDownload={handleDownload}
                  isDownloadingThis={downloadingIndex === index}
                />
              ))}

              {loading && !initialLoading && (
                <SkeletonGrid count={ITEMS_PER_PAGE} />
              )}
            </div>
          )}
           <div ref={endRef} className="h-4" /> 
        </>
      )}

      {selectedImageForModal && (
        <ImageDetailModal
          image={selectedImageForModal}
          onClose={closeModal}
        />
      )}
    </div>
  );
}