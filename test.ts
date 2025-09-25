import getPayload from "./lib/getPayload";
import data from "./db/media/58ebbb5d-b307-4f9b-8c40-f6762fa866c4.json";

const main = async () => {
  const payload = getPayload();
  console.log((await (await payload).find({collection:'roles',pagination:false})).docs)
};
main();
