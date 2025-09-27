// payload/collections/Settings.ts
import { CollectionConfig } from "payload";

const Settings: CollectionConfig = {
  slug: "settings",
  access: {
    read: () => true,
    create: () => true,
    update: () => true,
    delete: () => true,
  },
  fields: [
    {
      name: "mode",
      type: "select",
      options: [
        { label: "Unified", value: "unified" },
        { label: "Splited", value: "splited" },
      ],
      defaultValue: "unified",
      required: true,
    },
    {
      type: "array",
      name: "categoriesGroups",
      fields: [
        { name: "data", type: "relationship", hasMany: true, relationTo: "roles" },
        { name: "groupName", type: "text" },
      ],
    },

    {
      name: "sorting",
      type: "select",
      options: [
        { label: "By Name", value: "name" },
        { label: "By Number of Operations", value: "operations" },
      ],
      defaultValue: "name",
      required: true,
    },
  ],
};

export default Settings;
