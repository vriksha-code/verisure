
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { cn } from '@/lib/utils';

const SLIDESHOW_INTERVAL = 8000; // 8 seconds

export function DashboardBackground() {
  const backgroundImages = PlaceHolderImages.filter(img => 
    img.imageHint.includes('document') || 
    img.imageHint.includes('verification') ||
    img.imageHint.includes('marksheet') ||
    img.imageHint.includes('floor plan')
  );

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (backgroundImages.length > 1) {
      const timer = setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % backgroundImages.length);
      }, SLIDESHOW_INTERVAL);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, backgroundImages.length]);

  if (backgroundImages.length === 0) {
    return null;
  }

  return (
    <div className="background-slideshow" aria-hidden="true">
      {backgroundImages.map((image, index) => (
        <Image
          key={image.id}
          src={image.imageUrl}
          alt={image.description}
          fill
          priority={index === 0}
          className={cn(
            'background-slideshow-image',
            index === currentIndex ? 'opacity-100' : 'opacity-0'
          )}
        />
      ))}
    </div>
  );
}
