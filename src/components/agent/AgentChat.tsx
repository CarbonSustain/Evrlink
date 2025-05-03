import React, { useState, useRef, useEffect } from "react";
import { useAgent } from "../../hooks/useAgent";

// Generate a persistent user ID or retrieve from local storage
const getUserId = () => {
  const storageKey = 'evrlink-user-id';
  let userId = localStorage.getItem(storageKey);
  
  if (!userId) {
    // Generate a new user ID if none exists
    userId = `user_${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem(storageKey, userId);
  }
  
  return userId;
};

// Agent message component
const AgentMessage = ({ text, sender }: { text: string; sender: "user" | "agent" }) => {
  return (
    <div 
      className={`p-4 rounded-lg mb-3 max-w-[85%] ${
        sender === "user" 
          ? "bg-blue-500 text-white ml-auto" 
          : "bg-gray-200 text-gray-800"
      }`}
    >
      <div className="whitespace-pre-wrap break-words text-sm md:text-base">{text}</div>
    </div>
  );
};

// Thinking indicator component
const ThinkingIndicator = () => {
  return (
    <div className="flex space-x-2 p-3 rounded-lg bg-gray-100 w-16">
      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
    </div>
  );
};

// Suggested prompt component
const SuggestedPrompt = ({ text, onClick }: { text: string; onClick: () => void }) => {
  return (
    <button
      onClick={onClick}
      className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-2 rounded-full mr-2 mb-2 transition-colors"
    >
      {text}
    </button>
  );
};

// Suggested prompts that users might want to ask
const SUGGESTED_PROMPTS = [
  "How do I create a gift card?",
  "What blockchain networks are supported?",
  "How do I connect my wallet?",
  "Tell me about NFT backgrounds"
];

// Main agent chat component
export const AgentChat = () => {
  // Use a consistent user ID for this user
  const userId = getUserId();
  const { messages, sendMessage, isThinking, clearHistory, isOfflineMode, toggleOfflineMode } = useAgent(userId);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isThinking) {
      sendMessage(input);
      setInput("");
    }
  };

  const handleSuggestedPrompt = (prompt: string) => {
    if (!isThinking) {
      sendMessage(prompt);
    }
  };

  return (
    <div className="flex flex-col h-full w-full border rounded-lg overflow-hidden">
      {/* Chat header */}
      <div className="bg-blue-600 text-white p-4 flex justify-between items-center">
        <h2 className="text-xl font-bold">{isOfflineMode ? "Evrlink Agent" : "Onchain Agent"}</h2>
        <div className="flex items-center space-x-2">
          {/* Offline mode toggle */}
          <div 
            className="flex items-center cursor-pointer mr-2" 
            onClick={toggleOfflineMode}
            title={isOfflineMode ? "Switch to online mode" : "Switch to offline mode"}
          >
            <span className="text-xs mr-1">Offline</span>
            <div className={`w-8 h-4 rounded-full transition-colors ${isOfflineMode ? 'bg-green-400' : 'bg-gray-400'} relative`}>
              <div className={`absolute w-3 h-3 rounded-full bg-white top-0.5 transition-transform ${isOfflineMode ? 'translate-x-4' : 'translate-x-1'}`}></div>
            </div>
          </div>
          
          {/* Clear chat button */}
          {messages.length > 0 && (
            <button 
              onClick={clearHistory}
              className="text-xs bg-blue-700 hover:bg-blue-800 px-2 py-1 rounded"
              title="Clear chat history"
            >
              Clear Chat
            </button>
          )}
        </div>
      </div>
      
      {/* Mode indicator */}
      {isOfflineMode ? (
        <div className="bg-yellow-100 text-yellow-800 text-xs p-2 text-center">
          Offline Mode: Using simulated responses. No data will be sent to the server.
        </div>
      ) : (
        <div className="bg-green-100 text-green-800 text-xs p-2 text-center">
          Online Mode: Connected to Enhanced AgentKit Chatbot with NFT & Blockchain Capabilities
        </div>
      )}
      
      {/* Messages container */}
      <div className="flex-1 p-4 md:p-6 overflow-y-auto bg-gray-50">
        {messages.length === 0 ? (
          <div className="text-center my-8">
            <p className="text-gray-500 mb-4">Ask the agent anything about Evrlink!</p>
            <div className="flex flex-wrap justify-center">
              {SUGGESTED_PROMPTS.map((prompt, index) => (
                <SuggestedPrompt 
                  key={index} 
                  text={prompt} 
                  onClick={() => handleSuggestedPrompt(prompt)} 
                />
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, index) => (
            <AgentMessage key={index} text={msg.text} sender={msg.sender} />
          ))
        )}
        
        {isThinking && <ThinkingIndicator />}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input area */}
      <form onSubmit={handleSubmit} className="border-t p-3 flex items-center">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 p-3 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
          disabled={isThinking}
        />
        <button
          type="submit"
          disabled={!input.trim() || isThinking}
          className="bg-blue-600 text-white px-6 py-3 rounded-r-lg hover:bg-blue-700 disabled:bg-blue-300 font-medium"
        >
          Send
        </button>
      </form>
    </div>
  );
};