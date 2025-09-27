import { CollectionConfig } from "payload";

const Roles: CollectionConfig = {
  slug: "roles",
  admin:{
    useAsTitle:'name'
  },
  access: {
    read: () => true,
    create: () => true,
    update: () => true,
    delete: () => true,
  },
  fields: [{ name: "name", type: "text" }],
};

export default Roles;
