import { branches, GLOBAL_SETTINGS_ID } from "./app/(my-app)/constants";
import getPayload from "./lib/getPayload";

const loadInitialData = async () => {
  const payload = await getPayload();
  const { docs: conf } = await payload.find({ collection: "conf" });
  if (conf[0]) return;
  await payload.create({ collection: "conf", data: { name: "intilized" } });
  // Create global settings
  await payload.create({
    collection: "settings",
    data: {
      mode: "unified",
      sorting: "name",
      categoriesGroups: [],
    },
  });

  // Create branches and their settings
  for (const { name, nameInHebrew, searchKey } of branches) {
    const settings = await payload.create({
      collection: "settings",
      data: {
        mode: "unified",
        sorting: "name",
        categoriesGroups: [],
      },
    });
    await payload.create({
      collection: "branches",
      data: {
        name,
        nameInHebrew,
        searchKey,
        settings: settings.id,
      },
    });
  }
};

await loadInitialData();
process.exit();
