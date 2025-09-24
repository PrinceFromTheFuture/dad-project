import { CollectionConfig } from "payload";

const Sessions: CollectionConfig = {
  slug: "sessions",
  fields: [
    { name: "nickname", type: "text" },
    { name: "month", type: "number" },
    { name: "year", type: "number" },
  ],
};

export default Sessions;
