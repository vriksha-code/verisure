'use client';

import * as React from 'react';
import Image from 'next/image';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Card, CardContent } from '@/components/ui/card';

export function LoginCarousel() {
  const aiImages = PlaceHolderImages.filter((img) => img.imageHint.includes('ai'));
  return (
    <Carousel className="w-full max-w-lg">
      <CarouselContent>
        {aiImages.map((image) => (
          <CarouselItem key={image.id}>
            <div className="p-1">
              <Card>
                <CardContent className="flex aspect-video items-center justify-center p-6 relative">
                  <Image
                    src={image.imageUrl}
                    alt={image.description}
                    fill
                    className="rounded-lg object-cover"
                    data-ai-hint={image.imageHint}
                  />
                </CardContent>
              </Card>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );
}
