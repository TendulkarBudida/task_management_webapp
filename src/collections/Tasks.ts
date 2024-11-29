import type { CollectionConfig } from 'payload'

const Tasks: CollectionConfig = {
  slug: 'tasks',
  admin: {
    useAsTitle: 'title',
  },
  access: {
    create: ({ req: { user } }) => !!user,
    read: ({ req: { user } }) => {
      if (!user) return false;
      return {
        user: {
          equals: user.id,
        },
      };
    },
    update: ({ req: { user } }) => {
      if (!user) return false;
      return {
        user: {
          equals: user.id,
        },
      };
    },
    delete: ({ req: { user } }) => {
      if (!user) return false;
      return {
        user: {
          equals: user.id,
        },
      };
    },
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'To Do', value: 'TODO' },
        { label: 'In Progress', value: 'IN PROGRESS' },
        { label: 'Done', value: 'DONE' },
      ],
      required: true,
    },
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
    },
  ],
};

export default Tasks;

