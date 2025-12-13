import type { CollectionConfig } from 'payload';

export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: {
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
    },
    {
      name: 'layout',
      type: 'blocks',
      blocks: [
        {
          slug: 'hero',
          fields: [
            {
              name: 'type',
              type: 'select',
              options: ['default', 'centered', 'split'],
              defaultValue: 'default',
            },
            { name: 'heading', type: 'text' },
            { name: 'text', type: 'richText' },
            { name: 'backgroundImage', type: 'upload', relationTo: 'media' },
          ],
        },
        {
          slug: 'content',
          fields: [
            {
              name: 'content',
              type: 'richText',
            },
          ],
        },
      ],
    },
  ],
};
