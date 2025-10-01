import { getPayload as getPayloadClient } from "payload";
import config from "@/payload.config"; // Adjust path to your payload config

const getPayload = async () => await getPayloadClient({ config, });
export default getPayload