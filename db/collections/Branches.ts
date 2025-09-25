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
    { name: "name", type: "text" },
    { name: "searchKey", type: "text" },
    {
      name: "settings",
      type: "relationship",
      relationTo: "settings",
    },
  ],
};

export default Branches;
