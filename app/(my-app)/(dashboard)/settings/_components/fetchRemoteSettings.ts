import axios from "axios";
import { Setting } from "@/payload-types";

/**
 * Fetches remote settings for a specific branch via the local API proxy
 * This avoids CORS issues by making the request server-side
 * @param branchName - The name of the branch to fetch settings for
 * @returns Promise with the remote settings data
 */
export async function fetchRemoteSettings(branchName: string): Promise<Setting> {
  try {
    console.log(`Fetching remote settings for branch: ${branchName}`);
    
    // Use the local API route as a proxy to avoid CORS issues
    const settingsResponse = await axios.get(`/localapi/remote-settings/${encodeURIComponent(branchName)}`, {
      headers: {
        'Accept': 'application/json',
      },
    });
    
    console.log("Successfully fetched remote settings for:", branchName);
    
    return settingsResponse.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Error fetching remote settings:");
      console.error("- Status:", error.response?.status);
      console.error("- Error data:", error.response?.data);
      console.error("- Message:", error.message);
    } else {
      console.error("Non-axios error:", error);
    }
    throw error;
  }
}
