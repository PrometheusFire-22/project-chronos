import type { Block } from 'payload';

export const Content: Block = {
  slug: 'content',
  labels: {
    singular: 'Content',
    plural: 'Content Blocks',
  },
  fields: [
    {
      name: 'content',
      type: 'richText',
      label: 'Content',
      required: true,
      admin: {
        description: 'Main content for this section',
      },
    },
    {
      name: 'layout',
      type: 'select',
      label: 'Content Layout',
      options: [
        { label: 'Full Width', value: 'full' },
        { label: 'Centered', value: 'centered' },
        { label: 'Narrow', value: 'narrow' },
      ],
      defaultValue: 'centered',
    },
    {
      name: 'backgroundColor',
      type: 'select',
      label: 'Background Color',
      options: [
        { label: 'None', value: 'none' },
        { label: 'Light Gray', value: 'gray' },
        { label: 'Primary', value: 'primary' },
        { label: 'Accent', value: 'accent' },
      ],
      defaultValue: 'none',
    },
  ],
};
