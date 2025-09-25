import getPayload from "./lib/getPayload";

const main = async () => {
  const payload = getPayload();
  console.log((await (await payload).find({ collection: "branches" })).docs);
};
main()