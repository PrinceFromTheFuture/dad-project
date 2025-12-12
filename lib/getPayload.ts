import { getPayload as getPayloadClient, Payload } from "payload";
import config from "@/payload.config"; // Adjust path to your payload config

let cachedPayload: Payload | null = null;

const getPayload = async (): Promise<Payload> => {
  if (cachedPayload) {
    return cachedPayload;
  }

  cachedPayload = await getPayloadClient({ config });
  return cachedPayload;
};

export default getPayload;
