export interface BranchReport {
  id: string; // Name of the branch, extracted from the file or user input
  name: string;
  fileSize: number; // Size of the uploaded file (in bytes)
  createdAt: string; // Date when the file was created/uploaded
  totalAgents: number; // Number of agents in this branch
  totalOperations: number; // Total number of operations across all agents
}

export interface Operation {
  category: string;
  repeated: number;
}
export interface AgentView {
  nationalId: string;
  name: string;
  operations: number;
  branch: string;
  responsibility: string;
}
export interface Agent {
  name: string;
  responsibility: string;
  id: string;
  operations: Operation[];
}
export interface OperationView {
  category: string;
  repeated: number;
  agentId: string;
  branch: string;
}
