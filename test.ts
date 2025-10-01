import fs from "fs";
import data from "./db/media/58ebbb5d-b307-4f9b-8c40-f6762fa866c4.json";

const responsibilities: string[] = [];
const foramat = data.map((item) => {
  if (!responsibilities.includes(item.responsibility)) {
    responsibilities.push(item.responsibility);
  }
});

fs.writeFileSync("responsibilities.json", JSON.stringify(responsibilities));

console.log(responsibilities);
