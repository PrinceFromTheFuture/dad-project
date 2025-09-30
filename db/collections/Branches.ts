import { CollectionConfig } from "payload";

const Branches: CollectionConfig = {
  slug: "branches",
  access: {
    read: () => true,
    create: () => true,
    update: () => true,
    delete: () => true,
  },
  fields: [
    { name: "name", type: "text", required: true },
    { name: "searchKey", type: "text", required: true },
    { name: "nameInHebrew", type: "text", required: true },
    {
      name: "settings",
      type: "relationship",
      relationTo: "settings",
      required: true,
    },
  ],
};

export default Branches;
