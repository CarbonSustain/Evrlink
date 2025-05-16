import { useState, useEffect } from "react";
import { AgentMessage, AgentRequest, AgentResponse } from "../types/agent";

// In development, use localhost, in production use the API URL
const API_BASE_URL = import.meta.env.DEV ? 'http://localhost:3001' : import.meta.env.VITE_API_URL || 'https://api.evrlink.com';

// Offline mode responses for common questions
const OFFLINE_RESPONSES: Record<string, string> = {
  "how do i create a gift card": "To create a gift card in Evrlink, go to the 'Create' page, select a background, enter the recipient details, and specify the amount. You can then mint the gift card as an NFT. Gift cards can be personalized with custom messages and backgrounds to make them more special.",
  "what blockchain networks are supported": "Evrlink currently supports Ethereum, Polygon, and Base networks. You can select your preferred network when connecting your wallet. Base Sepolia is our recommended testnet for trying out features without spending real crypto.",
  "how do i connect my wallet": "To connect your wallet, click on the 'Connect Wallet' button in the top right corner. Evrlink supports MetaMask, WalletConnect, and Coinbase Wallet. Make sure you have one of these wallets installed before attempting to connect.",
  "tell me about nft backgrounds": "NFT backgrounds in Evrlink are customizable images that appear behind your gift cards. You can select from pre-made backgrounds or create your own in the 'Create Background' section. Artists can also mint and sell their own background designs on the platform.",
  "what is evrlink": "Evrlink is a platform that allows you to create and send digital gift cards as NFTs on the blockchain. It combines the personalization of traditional gift cards with the security and ownership benefits of blockchain technology.",
  "how do i claim a gift card": "To claim a gift card, you'll need the gift card ID and the secret code provided by the sender. Go to the 'Claim a Gift' page, enter these details, and connect your wallet to receive the gift card as an NFT.",
  "fees": "Evrlink charges minimal fees for creating and transferring gift cards. The exact fee depends on the blockchain network you're using and current gas prices. We strive to keep our platform affordable for all users.",
  "wallet details": "In offline mode, I can only provide general information about wallets. To get your specific wallet details, please switch to online mode where I can access your connected wallet information.",
  "help": "I can help you with information about creating gift cards, supported blockchain networks, connecting wallets, NFT backgrounds, claiming gifts, and platform fees. What would you like to know?",
  "default": "I'm currently in offline mode, but I can still help with common questions about Evrlink. You can ask about creating gift cards, supported blockchain networks, connecting wallets, backgrounds, claiming gifts, and platform fees."
};

// Find the best matching response for a query
function findOfflineResponse(query: string): string {
  const normalizedQuery = query.toLowerCase().trim();
  
  // Check for exact matches first
  for (const [key, response] of Object.entries(OFFLINE_RESPONSES)) {
    if (normalizedQuery === key) {
      return response;
    }
  }
  
  // Check for keyword matches
  const keywords = normalizedQuery.split(/\s+/);
  for (const [key, response] of Object.entries(OFFLINE_RESPONSES)) {
    for (const word of keywords) {
      if (word.length > 3 && key.includes(word)) {
        return response;
      }
    }
  }
  
  // Check for partial matches with the full query
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
  try {
    // If in offline mode or if the message contains 'wallet details' in offline mode,
    // return a simulated response
    if (offlineMode || userMessage.toLowerCase().includes('wallet details')) {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));
      return findOfflineResponse(userMessage);
    }

    // Try to connect to the Evrlink chatbot
    console.log('Sending message to agent:', { message: userMessage, userId });
    const endpoint = `${API_BASE_URL}/api/agent`;
    console.log('Agent endpoint:', endpoint);
    
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({ 
        message: userMessage,
        userId,
        context: {
          platform: "Evrlink",
          mode: "online",
          features: ["gift_cards", "nft_backgrounds", "wallet_management"],
          wallet: {
            address: process.env.REACT_APP_WALLET_ADDRESS || "",
            network: "base-sepolia"
          }
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = (await response.json()) as AgentResponse;
    console.log('Agent response:', data);
    return data.response ?? data.error ?? null;
  } catch (error) {
    console.error("Error communicating with Evrlink chatbot:", error);
    return findOfflineResponse(userMessage);
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
  // Initialize offline mode state from localStorage if available
  const [isOfflineMode, setIsOfflineMode] = useState(() => {
    const savedMode = localStorage.getItem('evrlink-offline-mode');
    return savedMode ? JSON.parse(savedMode) : false;
  });

  // Effect to handle offline mode changes
  useEffect(() => {
    localStorage.setItem('evrlink-offline-mode', JSON.stringify(isOfflineMode));
    if (isOfflineMode) {
      // Add a welcome message when switching to offline mode
      setMessages(prev => {
        if (prev.length === 0) {
          return [{
            text: "I'm now in offline mode. I can help you with common questions about Evrlink's features, gift cards, and blockchain functionality. What would you like to know?",
            sender: "agent"
          }];
        }
        return prev;
      });
    }
  }, [isOfflineMode]);

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
    
    // Add user message first
    setMessages(prev => [...prev, { text: input, sender: "user" }]);
    setIsThinking(true);

    try {
      // Get response from agent (using offline mode if enabled)
      const responseMessage = await messageAgent(input, isOfflineMode, userId);

      // Add agent response to conversation if received
      if (responseMessage) {
        setMessages(prev => [...prev, { text: responseMessage, sender: "agent" }]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Show error message to user
      setMessages(prev => [...prev, { 
        text: "Sorry, I'm having trouble connecting to the server. Please try again or switch to offline mode.", 
        sender: "agent" 
      }]);
    } finally {
      setIsThinking(false);
    }
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
    // Clear messages when toggling modes
    setMessages([]);
  };

  return { 
    messages, 
    sendMessage, 
    isThinking, 
    isOfflineMode, 
    toggleOfflineMode,
    setMessages
  };
}