import type { GlobalConfig } from 'payload';

export const Footer: GlobalConfig = {
  slug: 'footer',
  access: {
    read: () => true, // Public access for frontend
  },
  fields: [
    {
      name: 'columns',
      type: 'array',
      label: 'Footer Columns',
      minRows: 1,
      maxRows: 4,
      labels: {
        singular: 'Column',
        plural: 'Columns',
      },
      fields: [
        {
          name: 'heading',
          type: 'text',
          required: true,
          label: 'Column Heading',
        },
        {
          name: 'links',
          type: 'array',
          label: 'Links',
          minRows: 1,
          maxRows: 10,
          fields: [
            {
              name: 'label',
              type: 'text',
              required: true,
              label: 'Link Label',
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
                description: 'Or provide an external URL',
              },
            },
          ],
        },
      ],
    },
    {
      name: 'socialLinks',
      type: 'array',
      label: 'Social Media Links',
      maxRows: 10,
      labels: {
        singular: 'Social Link',
        plural: 'Social Links',
      },
      fields: [
        {
          name: 'platform',
          type: 'select',
          required: true,
          label: 'Platform',
          options: [
            { label: 'Twitter/X', value: 'twitter' },
            { label: 'LinkedIn', value: 'linkedin' },
            { label: 'GitHub', value: 'github' },
            { label: 'YouTube', value: 'youtube' },
            { label: 'Facebook', value: 'facebook' },
            { label: 'Instagram', value: 'instagram' },
          ],
        },
        {
          name: 'url',
          type: 'text',
          required: true,
          label: 'URL',
          admin: {
            description: 'Full URL to your profile',
          },
        },
      ],
    },
    {
      name: 'copyright',
      type: 'text',
      label: 'Copyright Text',
      defaultValue: '© 2025 Project Chronos. All rights reserved.',
    },
    {
      name: 'legalLinks',
      type: 'array',
      label: 'Legal Links',
      maxRows: 5,
      labels: {
        singular: 'Legal Link',
        plural: 'Legal Links',
      },
      admin: {
        description: 'Links to Privacy Policy, Terms of Service, etc.',
      },
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
          label: 'Link Label',
        },
        {
          name: 'link',
          type: 'relationship',
          relationTo: 'pages',
          label: 'Page Link',
        },
      ],
    },
  ],
};
