import type { CollectionConfig } from 'payload';
import { Hero, Content, MediaBlock, CallToAction } from '../blocks';

export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: {
    useAsTitle: 'title',
  },
  access: {
    read: () => true, // Public access for frontend
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Page Title',
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      label: 'Page Slug',
      admin: {
        description: 'URL path for this page (e.g., "about" for /about)',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Meta Description',
      admin: {
        description: 'SEO description for this page',
      },
    },
    {
      name: 'isHome',
      type: 'checkbox',
      label: 'Is Homepage',
      defaultValue: false,
      admin: {
        description: 'Mark this page as the site homepage',
        position: 'sidebar',
      },
    },
    {
      name: 'layout',
      type: 'blocks',
      label: 'Page Layout',
      blocks: [Hero, Content, MediaBlock, CallToAction],
      admin: {
        description: 'Build your page layout using reusable blocks',
      },
    },
  ],
};
