import getPayload from "./lib/getPayload";
import data from "./data.json";
const main = async () => {
  const ops = [];
  console.log(data.length);
  data.forEach((aget) => {
    for (const op of aget.operations) {
      ops.push(op);
    }
  });
  console.log(ops.length);
  console.log(ops.length/24/7);
};
main();
