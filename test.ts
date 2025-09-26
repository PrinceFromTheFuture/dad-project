import getPayload from "./lib/getPayload";
import data from "./db/media/58ebbb5d-b307-4f9b-8c40-f6762fa866c4.json";

const main = async () => {
  const payload = await getPayload();
  const labels: string[] = [];

  for (const agent of data) {
    if (!labels.includes(agent.responsibility)) {
      labels.push(agent.responsibility);
    }
  }
  for (const labef of labels) {
    await payload.create({ collection: "roles", data: { name: labef } });
  }
  process.exit();
};
main();
