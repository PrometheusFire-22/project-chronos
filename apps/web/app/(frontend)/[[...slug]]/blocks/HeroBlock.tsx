import React from 'react';
import Image from 'next/image';

type HeroBlockProps = {
  type?: 'default' | 'centered' | 'split';
  heading?: string;
  subheading?: string;
  text?: any; // Rich text content
  backgroundImage?: {
    url: string;
    alt?: string;
    width?: number;
    height?: number;
  };
  cta?: {
    show?: boolean;
    label?: string;
    link?: string;
    style?: 'primary' | 'secondary' | 'outline';
  };
};

export function HeroBlock({
  type = 'default',
  heading,
  subheading,
  text,
  backgroundImage,
  cta,
}: HeroBlockProps) {
  const layoutClass = {
    default: 'hero-default',
    centered: 'hero-centered text-center',
    split: 'hero-split grid md:grid-cols-2',
  }[type];

  return (
    <section className={`hero ${layoutClass} relative py-20`}>
      {backgroundImage && (
        <div className="absolute inset-0 z-0">
          <Image
            src={backgroundImage.url}
            alt={backgroundImage.alt || ''}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>
      )}

      <div className={`container mx-auto px-4 relative z-10 ${backgroundImage ? 'text-white' : ''}`}>
        {heading && <h1 className="text-4xl md:text-6xl font-bold mb-4">{heading}</h1>}
        {subheading && <p className="text-xl md:text-2xl mb-6 opacity-90">{subheading}</p>}
        {text && <div className="prose prose-lg max-w-none mb-8">{text}</div>}

        {cta?.show && cta.label && cta.link && (
          <a
            href={cta.link}
            className={`inline-block px-8 py-3 rounded-lg font-semibold transition-colors ${
              cta.style === 'primary'
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : cta.style === 'secondary'
                ? 'bg-gray-600 text-white hover:bg-gray-700'
                : 'border-2 border-current hover:bg-white/10'
            }`}
          >
            {cta.label}
          </a>
        )}
      </div>
    </section>
  );
}
