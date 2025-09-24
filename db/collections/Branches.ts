import { CollectionConfig } from "payload";

const Branches: CollectionConfig = {
  slug: "branches",
  fields: [{ name: "name", type: "text" },{name:'searchKey',type:'text'}],
};

export default Branches;
