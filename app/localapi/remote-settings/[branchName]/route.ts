import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import getPayload from "@/lib/getPayload";

const REMOTE_SERVER_URL = process.env.NEXT_PUBLIC_REMOTES_SERVER_URL || "http://localhost:3001";

export async function GET(
  request: NextRequest,
  { params }: { params: { branchName: string } }
) {
  try {
    const branchName = decodeURIComponent(params.branchName);
    
    console.log(`[Proxy] Fetching remote settings for branch: ${branchName}`);
    
    // Make the request server-side (no CORS issues)
    const response = await axios.get(
      `${REMOTE_SERVER_URL}/localapi/branchRemoteSettings/${encodeURIComponent(branchName)}`,
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    const remoteSettings = response.data;
    
    // Map remote role IDs to local role IDs by matching on name
    if (remoteSettings.categoriesGroups && Array.isArray(remoteSettings.categoriesGroups)) {
      const payload = await getPayload();
      
      // Fetch all local roles
      const { docs: localRoles } = await payload.find({
        collection: "roles",
        pagination: false,
      });
      
      // Fetch all remote roles to get the name mapping
      const remoteRolesResponse = await axios.get(`${REMOTE_SERVER_URL}/api/roles`, {
        params: { limit: 1000 },
      });
      const remoteRoles = remoteRolesResponse.data.docs || [];
      
      // Create a map: remote role ID -> role name
      const remoteRoleIdToName = new Map();
      remoteRoles.forEach((role: any) => {
        remoteRoleIdToName.set(role.id, role.name);
      });
      
      // Create a map: role name -> local role ID
      const roleNameToLocalId = new Map();
      localRoles.forEach((role) => {
        roleNameToLocalId.set(role.name, role.id);
      });
      
      // Map the role IDs in categoriesGroups
      remoteSettings.categoriesGroups = remoteSettings.categoriesGroups.map((group: any) => {
        if (group.data && Array.isArray(group.data)) {
          group.data = group.data.map((roleRef: any) => {
            const remoteRoleId = typeof roleRef === 'string' ? roleRef : roleRef.id;
            const roleName = remoteRoleIdToName.get(remoteRoleId);
            const localRoleId = roleName ? roleNameToLocalId.get(roleName) : null;
            
            return localRoleId || remoteRoleId; // Fallback to remote ID if not found
          });
        }
        return group;
      });
    }

    console.log(`[Proxy] Successfully fetched and mapped settings for: ${branchName}`);
    
    return NextResponse.json(remoteSettings);
  } catch (error) {
    console.error("[Proxy] Error fetching remote settings:", error);
    
    if (axios.isAxiosError(error)) {
      return NextResponse.json(
        { error: error.message, details: error.response?.data },
        { status: error.response?.status || 500 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to fetch remote settings" },
      { status: 500 }
    );
  }
}
