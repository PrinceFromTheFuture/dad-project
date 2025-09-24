//@
import data from "../MisradRashi-pkidim-aug-25.txt";

const formData = new FormData();
formData.append("branchNames", JSON.stringify(["ashdod", "ashdod"]));
formData.append("date", "2025-09-24T15:44:00.000Z");
formData.append("files", new File([data], "file.txt", { type: "plain/text" }));
formData.append("files", new File([data], "hi.txt", { type: "plain/text" }));

fetch("localhost:3000/localapi/sessions/new", {
  method: "POST",
  body: formData,
})
  .then((res) => res.json())
  .then((data) => console.log(data))
  .catch((error) => console.error(error));
