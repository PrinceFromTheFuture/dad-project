import getPayload from "@/lib/getPayload";
import axios from "axios";
import { branches, GLOBAL_SETTINGS_ID, roles } from "./app/(my-app)/constants";

const REMOTE_SERVER_URL = process.env.NEXT_PUBLIC_REMOTES_SERVER_URL || "http://localhost:3001";

console.log(process.env.DATABASE_URI)
/**
 * Fetches all documents from a collection on the remote server
 */
async function fetchRemoteCollection(collectionName: string) {
  try {
    const response = await axios.get(`${REMOTE_SERVER_URL}/api/${collectionName}`, {
      params: { limit: 1000 }, // Fetch all documents
    });
    return response.data.docs || [];
  } catch (error) {
    console.error(`Error fetching ${collectionName} from remote server:`, error);
    return [];
  }
}

const loadInitialData = async () => {
  const payload = await getPayload();
  const config = await payload.find({ collection: "conf" });
  if (config.docs.length > 0) {
    return;
  }

  console.log("Initializing database...");

  // Create config
  await payload.create({
    collection: "conf",
    data: {
      isDbStarted: true,
      isRemoteSettingsEnabled: true,
    },
  });

  console.log("Fetching data from remote server...");

  // Fetch data from remote server
  const remoteRoles = await fetchRemoteCollection("roles");
  const remoteSettings = await fetchRemoteCollection("settings");
  const remoteBranches = await fetchRemoteCollection("branches");

  console.log(`Found ${remoteRoles.length} roles, ${remoteSettings.length} settings, ${remoteBranches.length} branches on remote server`);

  // Create roles with their original IDs
  const roleIdMap = new Map();
  for (const role of remoteRoles) {
    const created = await payload.create({
      collection: "roles",
      data: {
        id: role.id,
        name: role.name,
      },
    });
    roleIdMap.set(role.id, created.id);
    console.log(`Created role: ${role.name}`);
  }

  // Create settings with their original IDs
  const settingsIdMap = new Map();
  for (const setting of remoteSettings) {
    // Map role IDs in categoriesGroups if they exist
    let categoriesGroups = setting.categoriesGroups;
    if (categoriesGroups && Array.isArray(categoriesGroups)) {
      categoriesGroups = categoriesGroups.map((group: any) => ({
        ...group,
        data: group.data?.map((roleRef: any) => {
          const roleId = typeof roleRef === 'string' ? roleRef : roleRef.id;
          return roleIdMap.get(roleId) || roleId;
        }),
      }));
    }

    const created = await payload.create({
      collection: "settings",
      data: {
        id: setting.id,
        mode: setting.mode,
        sorting: setting.sorting,
        categoriesGroups: categoriesGroups || [],
      },
    });
    settingsIdMap.set(setting.id, created.id);
    console.log(`Created setting: ${setting.id}`);
  }

  // Create branches with their original IDs
  for (const branch of remoteBranches) {
    const settingsId = typeof branch.settings === 'string' ? branch.settings : branch.settings?.id;
    const mappedSettingsId = settingsIdMap.get(settingsId) || settingsId;
console.log(branch.id,)
    await payload.create({
      collection: "branches",
      data: {
        id: branch.id,
        name: branch.name,
        nameInHebrew: branch.nameInHebrew,
        searchKey: branch.searchKey,
        settings: mappedSettingsId,
        useRemoteSettings: branch.useRemoteSettings || false,
      },
    });
    console.log(`Created branch: ${branch.name}`);
  }

  console.log("Database initialization complete!");
};

await loadInitialData();
process.exit();
