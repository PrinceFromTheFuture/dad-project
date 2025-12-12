import { branches, GLOBAL_SETTINGS_ID, roles } from '@/lib/constants'
import getPayload from '@/lib/getPayload'

const loadInitialData = async () => {
  const payload = await getPayload()
  // Create global settings
  await payload.create({
    collection: 'settings',
    data: {
      mode: 'unified',
      sorting: 'name',
      id: GLOBAL_SETTINGS_ID,
      categoriesGroups: [],
    },
  })

  // Create branches and their settings
  for (const role of roles) {
    await payload.create({ collection: 'roles', data: { name: role } })
  }
  for (const { name, nameInHebrew, searchKey } of branches) {
    const settings = await payload.create({
      collection: 'settings',
      data: {
        mode: 'splited',
        sorting: 'name',
        categoriesGroups: [],
      },
    })

    await payload.create({
      collection: 'branches',
      data: {
        name,
        nameInHebrew,
        searchKey,
        settings: settings.id,
      },
    })
  }
}

await loadInitialData()
process.exit()
