import { CollectionConfig } from "payload";

const Sessions: CollectionConfig = {
  slug: "sessions",
  access: {
    read: () => true,
    create: () => true,
    update: () => true,
    delete: () => true,
  },
  fields: [
    { name: "nickname", type: "text" },
    { name: "month", type: "number" },
    { name: "year", type: "number" },
  ],
};

export default Sessions;
