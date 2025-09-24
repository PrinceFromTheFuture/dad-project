import { CollectionConfig } from "payload";

const Reports: CollectionConfig = {
  slug: "reports",
  fields: [
    { name: "name", type: "text" },
    { name: "branch", type: "relationship", relationTo: "branches" ,required:true},
    { name: "rawReport", type: "relationship", relationTo: "media",required:true },
    { name: "agents", type: "relationship", relationTo: "media",required:true },
    { name: "session", type: "relationship", relationTo: "sessions",required:true },
  ],
};

export default Reports;
