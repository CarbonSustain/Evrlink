import { useState, useEffect } from "react";
import { AgentMessage, AgentRequest, AgentResponse } from "../types/agent";
import { API_BASE_URL } from "../services/api";

// Offline mode responses for common questions
const OFFLINE_RESPONSES: Record<string, string> = {
  "how do i create a gift card": "To create a gift card in Evrlink, go to the 'Create' page, select a background, enter the recipient details, and specify the amount. You can then mint the gift card as an NFT.",
  "what blockchain networks are supported": "Evrlink currently supports Ethereum, Polygon, and Base networks. You can select your preferred network when connecting your wallet.",
  "how do i connect my wallet": "To connect your wallet, click on the 'Connect Wallet' button in the top right corner. Evrlink supports MetaMask, WalletConnect, and Coinbase Wallet.",
  "tell me about nft backgrounds": "NFT backgrounds in Evrlink are customizable images that appear behind your gift cards. You can select from pre-made backgrounds or create your own in the 'Create Background' section.",
  "default": "I'm currently in offline mode. When connected to the backend, I can provide more detailed assistance with Evrlink features and functionality."
};

// Find the best matching response for a query
function findOfflineResponse(query: string): string {
  const normalizedQuery = query.toLowerCase().trim();
  
  // Check for exact matches first
  if (OFFLINE_RESPONSES[normalizedQuery]) {
    return OFFLINE_RESPONSES[normalizedQuery];
  }
  
  // Check for partial matches
  for (const [key, response] of Object.entries(OFFLINE_RESPONSES)) {
    if (normalizedQuery.includes(key) || key.includes(normalizedQuery)) {
      return response;
    }
  }
  
  // Return default response if no match found
  return OFFLINE_RESPONSES["default"];
}

/**
 * Sends a user message to the agent API and retrieves the agent's response.
 *
 * @async
 * @function messageAgent
 * @param {string} userMessage - The message sent by the user.
 * @param {boolean} offlineMode - Whether to use offline mode.
 * @param {string} userId - The ID of the user sending the message.
 * @returns {Promise<string | null>} The agent's response message or `null` if an error occurs.
 */
async function messageAgent(userMessage: string, offlineMode: boolean = false, userId: string = "default"): Promise<string | null> {
  // If in offline mode, return a simulated response
  if (offlineMode) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    return findOfflineResponse(userMessage);
  }

  try {
    // Use a relative URL for the chatbot endpoint so it works on both local and deployed environments
    const chatbotUrl = "/api/agent";
    
    console.log("Connecting to enhanced AgentKit chatbot at:", chatbotUrl);
    console.log("Sending message:", userMessage);
    console.log("User ID:", userId);
    
    const response = await fetch(chatbotUrl, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
      },
      // Send the message and userId in the format expected by the enhanced chatbot
      body: JSON.stringify({ userMessage, userId } as AgentRequest),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = (await response.json()) as AgentResponse;
    return data.response ?? data.error ?? null;
  } catch (error) {
    console.error("Error communicating with enhanced AgentKit chatbot:", error);
    
    // Try the original backend endpoint as fallback
    try {
      console.log("Falling back to original backend endpoint");
      const response = await fetch(`${API_BASE_URL}/api/agent`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
        },
        // Original backend expects 'message' instead of 'userMessage'
        // Also include userId for user-specific wallet
        body: JSON.stringify({ message: userMessage, userId }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = (await response.json()) as AgentResponse;
      return data.response ?? data.error ?? null;
    } catch (fallbackError) {
      console.error("Error communicating with fallback agent:", fallbackError);
      
      // If both endpoints fail, fall back to offline mode
      console.log("Falling back to offline mode due to network errors");
      return findOfflineResponse(userMessage);
    }
  }
}

// Storage key for chat history
const STORAGE_KEY = 'evrlink-agent-chat-history';

/**
 * This hook manages interactions with the onchain AI agent.
 * It connects to the backend server by default (online mode)
 * but can fall back to offline mode if needed.
 */
export function useAgent(userId: string = `user_${Math.random().toString(36).substring(2, 9)}`) {
  // Initialize state from localStorage if available
  const [messages, setMessages] = useState<AgentMessage[]>(() => {
    const savedMessages = localStorage.getItem(STORAGE_KEY);
    return savedMessages ? JSON.parse(savedMessages) : [];
  });
  
  const [isThinking, setIsThinking] = useState(false);
  // Default to online mode (false) to use the backend onchain agent
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  /**
   * Sends a user message, updates local state, and retrieves the agent's response.
   *
   * @param {string} input - The message from the user.
   */
  const sendMessage = async (input: string) => {
    if (!input.trim()) return;

    // Add user message to conversation
    setMessages(prev => [...prev, { text: input, sender: "user" }]);
    setIsThinking(true);

    // Get response from agent (using offline mode if enabled)
    const responseMessage = await messageAgent(input, isOfflineMode, userId);

    // Add agent response to conversation if received
    if (responseMessage) {
      setMessages(prev => [...prev, { text: responseMessage, sender: "agent" }]);
    }

    setIsThinking(false);
  };

  /**
   * Clears the chat history
   */
  const clearHistory = () => {
    setMessages([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  /**
   * Toggles offline mode
   */
  const toggleOfflineMode = () => {
    setIsOfflineMode(prev => !prev);
  };

  return { 
    messages, 
    sendMessage, 
    isThinking, 
    clearHistory,
    isOfflineMode,
    toggleOfflineMode
  };
}