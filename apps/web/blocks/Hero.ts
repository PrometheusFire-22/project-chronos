import type { Block } from 'payload';

export const Hero: Block = {
  slug: 'hero',
  labels: {
    singular: 'Hero',
    plural: 'Hero Blocks',
  },
  fields: [
    {
      name: 'type',
      type: 'select',
      label: 'Layout Type',
      options: [
        { label: 'Default', value: 'default' },
        { label: 'Centered', value: 'centered' },
        { label: 'Split', value: 'split' },
      ],
      defaultValue: 'default',
      required: true,
    },
    {
      name: 'heading',
      type: 'text',
      label: 'Heading',
      required: true,
    },
    {
      name: 'subheading',
      type: 'text',
      label: 'Subheading',
      admin: {
        description: 'Optional subheading text',
      },
    },
    {
      name: 'text',
      type: 'richText',
      label: 'Description',
      admin: {
        description: 'Main hero description text',
      },
    },
    {
      name: 'backgroundImage',
      type: 'upload',
      relationTo: 'media',
      label: 'Background Image',
      admin: {
        description: 'Optional background image for the hero section',
      },
    },
    {
      name: 'cta',
      type: 'group',
      label: 'Call to Action',
      fields: [
        {
          name: 'show',
          type: 'checkbox',
          label: 'Show CTA Button',
          defaultValue: true,
        },
        {
          name: 'label',
          type: 'text',
          label: 'Button Label',
          admin: {
            condition: (data) => data?.cta?.show === true,
          },
        },
        {
          name: 'link',
          type: 'text',
          label: 'Button Link',
          admin: {
            condition: (data) => data?.cta?.show === true,
          },
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
          admin: {
            condition: (data) => data?.cta?.show === true,
          },
        },
      ],
    },
  ],
};
