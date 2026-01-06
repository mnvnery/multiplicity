import type { CollectionConfig } from 'payload'

export const Events: CollectionConfig = {
  slug: 'events',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'date', 'location', 'status'],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'ticketUrl',
      type: 'text',
      admin: {
        description: 'URL for ticket purchasing',
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'upcoming',
      options: [
        {
          label: 'Upcoming',
          value: 'upcoming',
        },
        {
          label: 'Past',
          value: 'past',
        },
      ],
    },
    {
      name: 'date',
      type: 'date',
      required: true,
      admin: {
        date: {
          pickerAppearance: 'dayOnly',
        },
      },
    },
    {
      name: 'host',
      type: 'richText',
      admin: {
        description:
          'Optional host information (e.g., "HOSTED BY ELIZA WILLIAMS - EDITOR OF CREATIVE REVIEW")',
      },
    },
    {
      name: 'location',
      type: 'group',
      fields: [
        {
          name: 'address',
          type: 'textarea',
        },
        {
          name: 'addressLink',
          type: 'text',
        },
      ],
    },
    {
      name: 'description',
      type: 'richText',
      required: true,
    },
    {
      name: 'images',
      type: 'array',
      required: false,
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
        {
          name: 'aspectRatio',
          type: 'select',
          required: false,
          defaultValue: 'landscape',
          options: [
            {
              label: 'Portrait',
              value: 'portrait',
            },
            {
              label: 'Landscape',
              value: 'landscape',
            },
            {
              label: 'Square',
              value: 'square',
            },
          ],
          admin: {
            description: 'Aspect ratio preset for the image display',
          },
        },
      ],
    },
    {
      name: 'speakers',
      type: 'array',
      minRows: 1,
      fields: [
        {
          name: 'studioName',
          type: 'text',
          required: false,
        },
        {
          name: 'names',
          type: 'text',
          required: true,
        },
        {
          name: 'socials',
          type: 'richText',
          admin: {
            description: 'Social / Website links',
          },
        },
        {
          name: 'bio',
          type: 'richText',
        },
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
        },
      ],
    },

    {
      name: 'sponsors',
      type: 'array',
      minRows: 1,
      required: false,
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
      ],
    },
  ],
}
