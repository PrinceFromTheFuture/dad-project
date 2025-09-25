import { CollectionConfig } from "payload";

const Roles: CollectionConfig = {
  slug: "roles",
  access: {
    read: () => true,
    create: () => true,
    update: () => true,
    delete: () => true,
  },
  fields: [{ name: "name", type: "text" }],
};

export default Roles;
