import React from 'react';

type ContentBlockProps = {
  content?: any; // Rich text content
  layout?: 'full' | 'centered' | 'narrow';
  backgroundColor?: 'none' | 'gray' | 'primary' | 'accent';
};

export function ContentBlock({
  content,
  layout = 'centered',
  backgroundColor = 'none',
}: ContentBlockProps) {
  const layoutClass = {
    full: 'max-w-full',
    centered: 'max-w-4xl mx-auto',
    narrow: 'max-w-2xl mx-auto',
  }[layout];

  const bgClass = {
    none: '',
    gray: 'bg-gray-50',
    primary: 'bg-blue-50',
    accent: 'bg-purple-50',
  }[backgroundColor];

  return (
    <section className={`content-block py-16 ${bgClass}`}>
      <div className={`container px-4 ${layoutClass}`}>
        <div className="prose prose-lg max-w-none">{content}</div>
      </div>
    </section>
  );
}
