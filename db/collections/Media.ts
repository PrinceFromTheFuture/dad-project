import { CollectionConfig } from "payload";
import path from "path";
import { fileURLToPath } from "url";
import { v4 as uuidv4 } from "uuid";

// Recreate __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const Media: CollectionConfig = {
  access: {
    read: () => true,
    create: () => true,
    update: () => true,
    delete: () => true,
  },
  slug: "media",
  fields: [{ name: "name", type: "text" }],
  upload: {
    staticDir: path.resolve(__dirname, "../media"),
  },
  admin: {
    useAsTitle: "name",
  },
};

export default Media;
