import React from 'react';
import Image from 'next/image';

type MediaBlockComponentProps = {
  media?: {
    url: string;
    alt?: string;
    width?: number;
    height?: number;
  };
  caption?: string;
  size?: 'small' | 'medium' | 'large' | 'full';
  position?: 'left' | 'center' | 'right';
};

export function MediaBlockComponent({
  media,
  caption,
  size = 'large',
  position = 'center',
}: MediaBlockComponentProps) {
  if (!media?.url) {
    return null;
  }

  const sizeClass = {
    small: 'max-w-md',
    medium: 'max-w-2xl',
    large: 'max-w-4xl',
    full: 'max-w-full',
  }[size];

  const positionClass = {
    left: 'mr-auto',
    center: 'mx-auto',
    right: 'ml-auto',
  }[position];

  return (
    <section className="media-block py-12">
      <div className="container px-4">
        <figure className={`${sizeClass} ${positionClass}`}>
          <div className="relative w-full aspect-video">
            <Image
              src={media.url}
              alt={media.alt || caption || ''}
              fill
              className="object-cover rounded-lg"
            />
          </div>
          {caption && (
            <figcaption className="mt-4 text-center text-gray-600 italic">
              {caption}
            </figcaption>
          )}
        </figure>
      </div>
    </section>
  );
}
