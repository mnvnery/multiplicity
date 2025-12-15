import type { GlobalConfig } from 'payload'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  admin: {
    group: 'Settings',
  },
  fields: [
    {
      name: 'heroImages',
      type: 'array',
      minRows: 1,
      required: true,
      admin: {
        description: 'Hero image carousel shown at the top of the homepage',
      },
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
      ],
    },
    {
      name: 'aboutParagraphs',
      type: 'array',
      minRows: 1,
      admin: {
        description: 'About paragraphs shown below the hero image',
      },
      fields: [
        {
          name: 'text',
          type: 'textarea',
          required: true,
        },
      ],
    },
    {
      name: 'socialLinks',
      type: 'group',
      fields: [
        {
          name: 'instagram',
          type: 'text',
        },
        {
          name: 'linkedin',
          type: 'text',
        },
      ],
    },
    {
      name: 'footer',
      type: 'group',
      fields: [
        {
          name: 'name',
          type: 'text',
          defaultValue: 'Sam',
          admin: {
            description: "Contact person's name",
          },
        },
        {
          name: 'email',
          type: 'text',
          defaultValue: 'sam.williams@foilco.com',
          admin: {
            description: "Contact person's email",
          },
        },
        {
          name: 'companyText',
          type: 'text',
          defaultValue: 'WINTEN & COMPANY',
          hidden: true,
        },
        {
          name: 'links',
          type: 'array',
          hidden: true,
          fields: [
            {
              name: 'label',
              type: 'text',
              required: true,
            },
            {
              name: 'url',
              type: 'text',
              required: true,
            },
          ],
        },
      ],
    },
  ],
}
