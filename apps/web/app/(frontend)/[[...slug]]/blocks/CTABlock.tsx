import React from 'react';

type CTABlockProps = {
  heading?: string;
  text?: string;
  buttons?: Array<{
    label: string;
    link: string;
    style?: 'primary' | 'secondary' | 'outline';
  }>;
  backgroundColor?: 'none' | 'primary' | 'accent' | 'dark';
};

export function CTABlock({
  heading,
  text,
  buttons = [],
  backgroundColor = 'primary',
}: CTABlockProps) {
  const bgClass = {
    none: 'bg-white',
    primary: 'bg-blue-600 text-white',
    accent: 'bg-purple-600 text-white',
    dark: 'bg-gray-900 text-white',
  }[backgroundColor];

  return (
    <section className={`cta-block py-20 ${bgClass}`}>
      <div className="container mx-auto px-4 text-center">
        {heading && <h2 className="text-3xl md:text-5xl font-bold mb-6">{heading}</h2>}
        {text && <p className="text-lg md:text-xl mb-10 opacity-90 max-w-2xl mx-auto">{text}</p>}

        {buttons.length > 0 && (
          <div className="flex flex-wrap gap-4 justify-center">
            {buttons.map((button, index) => (
              <a
                key={index}
                href={button.link}
                className={`inline-block px-8 py-3 rounded-lg font-semibold transition-colors ${
                  button.style === 'primary'
                    ? 'bg-white text-blue-600 hover:bg-gray-100'
                    : button.style === 'secondary'
                    ? 'bg-blue-700 text-white hover:bg-blue-800'
                    : 'border-2 border-white text-white hover:bg-white/10'
                }`}
              >
                {button.label}
              </a>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
