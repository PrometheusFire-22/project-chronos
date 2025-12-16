import type { GlobalConfig } from 'payload';

export const Header: GlobalConfig = {
  slug: 'header',
  access: {
    read: () => true, // Public access for frontend
  },
  fields: [
    {
      name: 'navItems',
      type: 'array',
      label: 'Navigation Items',
      minRows: 1,
      maxRows: 10,
      labels: {
        singular: 'Nav Item',
        plural: 'Nav Items',
      },
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
          label: 'Label',
        },
        {
          name: 'link',
          type: 'relationship',
          relationTo: 'pages',
          label: 'Page Link',
          admin: {
            description: 'Link to an internal page',
          },
        },
        {
          name: 'externalLink',
          type: 'text',
          label: 'External Link',
          admin: {
            description: 'Or provide an external URL (starts with http)',
          },
        },
      ],
    },
    {
      name: 'ctaButton',
      type: 'group',
      label: 'Call to Action Button',
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
          defaultValue: 'Get Started',
          admin: {
            condition: (data) => data?.show === true,
          },
        },
        {
          name: 'link',
          type: 'text',
          label: 'Button Link',
          defaultValue: '/contact',
          admin: {
            condition: (data) => data?.show === true,
          },
        },
      ],
    },
  ],
};
