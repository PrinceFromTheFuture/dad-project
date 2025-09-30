import { CollectionConfig } from "payload";
import path from "path";
import { fileURLToPath } from "url";
import { v4 as uuidv4 } from "uuid";

// Recreate __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const Conf: CollectionConfig = {
  access: {
    read: () => true,
    create: () => true,
    update: () => true,
    delete: () => true,
  },
  slug: "conf",
  fields: [{ name: "name", type: "text" }],
};

export default Conf;
