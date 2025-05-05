export type AgentRequest = { 
  userMessage?: string; // For enhanced AgentKit chatbot
  message?: string;    // For original backend
  userId?: string;     // User ID for wallet management
};

export type AgentResponse = { 
  response?: string; 
  error?: string;
};

// Message type for the agent conversation
export type AgentMessage = {
  text: string;
  sender: "user" | "agent";
};

// Agent context type for storing agent state
export interface AgentContext {
  messages: AgentMessage[];
  isThinking: boolean;
  sendMessage: (input: string) => Promise<void>;
}