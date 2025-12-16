import type { Block } from 'payload';

export const CallToAction: Block = {
  slug: 'cta',
  labels: {
    singular: 'Call to Action',
    plural: 'CTA Blocks',
  },
  fields: [
    {
      name: 'heading',
      type: 'text',
      label: 'Heading',
      required: true,
    },
    {
      name: 'text',
      type: 'textarea',
      label: 'Description',
      admin: {
        description: 'Brief description text',
      },
    },
    {
      name: 'buttons',
      type: 'array',
      label: 'Buttons',
      minRows: 1,
      maxRows: 3,
      labels: {
        singular: 'Button',
        plural: 'Buttons',
      },
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
          label: 'Button Label',
        },
        {
          name: 'link',
          type: 'text',
          required: true,
          label: 'Button Link',
        },
        {
          name: 'style',
          type: 'select',
          label: 'Button Style',
          options: [
            { label: 'Primary', value: 'primary' },
            { label: 'Secondary', value: 'secondary' },
            { label: 'Outline', value: 'outline' },
          ],
          defaultValue: 'primary',
        },
      ],
    },
    {
      name: 'backgroundColor',
      type: 'select',
      label: 'Background Color',
      options: [
        { label: 'None', value: 'none' },
        { label: 'Primary', value: 'primary' },
        { label: 'Accent', value: 'accent' },
        { label: 'Dark', value: 'dark' },
      ],
      defaultValue: 'primary',
    },
  ],
};
