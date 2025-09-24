import getPayload from "./lib/getPayload";

async function main() {
  const payload = await getPayload();
  await payload.delete({collection:'reports',where:{}})
  await payload.delete({collection:'media',where:{}})
  await payload.delete({collection:'sessions',where:{}})
  process.exit()
}
main()
