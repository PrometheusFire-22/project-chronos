import type { CollectionConfig } from 'payload';

export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  admin: {
    useAsTitle: 'email',
  },
  access: {
    // Allow first user creation without auth
    create: async ({ req }) => {
      // If no users exist, allow creation
      const users = await req.payload.find({
        collection: 'users',
        limit: 1,
      });

      if (users.totalDocs === 0) {
        return true;
      }

      // Otherwise require admin
      return req.user?.id ? true : false;
    },
    // Logged in users can read
    read: ({ req }) => Boolean(req.user),
    // Users can update themselves, admins can update anyone
    update: ({ req }) => Boolean(req.user),
    // Only admins can delete
    delete: ({ req }) => Boolean(req.user),
  },
  fields: [
    // Email and Password are added by default with auth: true
  ],
};
