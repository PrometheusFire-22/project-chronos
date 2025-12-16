import React from 'react';
import { HeroBlock } from './blocks/HeroBlock';
import { ContentBlock } from './blocks/ContentBlock';
import { MediaBlockComponent } from './blocks/MediaBlockComponent';
import { CTABlock } from './blocks/CTABlock';

type Block = {
  blockType: string;
  [key: string]: any;
};

type RenderBlocksProps = {
  blocks: Block[];
};

export function RenderBlocks({ blocks }: RenderBlocksProps) {
  if (!blocks || blocks.length === 0) {
    return null;
  }

  return (
    <>
      {blocks.map((block, index) => {
        const { blockType } = block;

        switch (blockType) {
          case 'hero':
            return <HeroBlock key={index} {...block} />;
          case 'content':
            return <ContentBlock key={index} {...block} />;
          case 'mediaBlock':
            return <MediaBlockComponent key={index} {...block} />;
          case 'cta':
            return <CTABlock key={index} {...block} />;
          default:
            console.warn(`Unknown block type: ${blockType}`);
            return null;
        }
      })}
    </>
  );
}
