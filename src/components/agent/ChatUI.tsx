import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { useAgent } from "../../hooks/useAgent";

// Suggested questions and their answers in offline mode
const SUGGESTED_QA: Record<string, string> = {
  "How do I create a gift card?": "To create a gift card in Evrlink, go to the 'Create' page, select a background, enter the recipient details, and specify the amount. You can then mint the gift card as an NFT. Gift cards can be personalized with custom messages and backgrounds to make them more special.",
  "What blockchain networks are supported?": "Evrlink currently supports Ethereum, Polygon, and Base networks. You can select your preferred network when connecting your wallet. Base Sepolia is our recommended testnet for trying out features without spending real crypto.",
  "How do I connect my wallet?": "To connect your wallet, click on the 'Connect Wallet' button in the top right corner. Evrlink supports MetaMask, WalletConnect, and Coinbase Wallet. Make sure you have one of these wallets installed before attempting to connect.",
  "Tell me about NFT backgrounds": "NFT backgrounds in Evrlink are customizable images that appear behind your gift cards. You can select from pre-made backgrounds or create your own in the 'Create Background' section. Artists can also mint and sell their own background designs on the platform.",
  "What is Evrlink?": "Evrlink is a platform that allows you to create and send digital gift cards as NFTs on the blockchain. It combines the personalization of traditional gift cards with the security and ownership benefits of blockchain technology.",
  "How do I claim a gift card?": "To claim a gift card, you'll need the gift card ID and the secret code provided by the sender. Go to the 'Claim a Gift' page, enter these details, and connect your wallet to receive the gift card as an NFT.",
  "What are the fees?": "Evrlink charges minimal fees for creating and transferring gift cards. The exact fee depends on the blockchain network you're using and current gas prices. We strive to keep our platform affordable for all users.",
  "Tell me about wallet details": "In offline mode, I can only provide general information about wallets. To get your specific wallet details, please switch to online mode where I can access your connected wallet information.",
  "Help": "I can help you with information about creating gift cards, supported blockchain networks, connecting wallets, NFT backgrounds, claiming gifts, and platform fees. What would you like to know?"
};

// List of questions for display
const SUGGESTED_QUESTIONS = Object.keys(SUGGESTED_QA);

interface SuggestedQuestionProps {
  question: string;
  onClick: (question: string) => void;
  disabled: boolean;
}

const SuggestedQuestion: React.FC<SuggestedQuestionProps> = ({ question, onClick, disabled }) => (
  <button
    onClick={() => onClick(question)}
    disabled={disabled}
    className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-2 rounded-lg mr-2 mb-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
  >
    {question}
  </button>
);

interface ChatUIProps {
  isMinimized: boolean;
  onMinimize: () => void;
  onClose: () => void;
}

interface Message {
  text: string;
  sender: "user" | "agent";
}

export const ChatUI: React.FC<ChatUIProps> = ({ isMinimized, onMinimize, onClose }) => {
  const [input, setInput] = useState("");
  const { messages, sendMessage, isThinking, isOfflineMode, toggleOfflineMode, setMessages } = useAgent();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Function to scroll to the bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Auto-scroll whenever messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const onSendMessage = async (message: string) => {
    if (message.trim()) {
      setInput("");
      await sendMessage(message);
    }
  };

  if (isMinimized) {
    return (
      <div className="fixed bottom-20 right-4 w-96 bg-white dark:bg-gray-800 shadow-lg rounded-lg">
        <div className="bg-blue-600 text-white p-2 flex justify-between items-center rounded-lg">
          <h2 className="text-lg font-bold">Evrlink Assistant</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => toggleOfflineMode()}
              className="text-white hover:text-gray-200 transition-colors px-3 py-1 rounded"
              title={isOfflineMode ? "Go Online" : "Go Offline"}
            >
              {isOfflineMode ? "Go Online" : "Go Offline"}
            </button>
            <button
              onClick={onMinimize}
              className="text-white hover:text-gray-200 transition-colors"
              title="Maximize"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-20 right-4 w-96 h-[550px] bg-white dark:bg-gray-800 shadow-lg rounded-lg flex flex-col">
      {/* Header */}
      <div className="bg-blue-600 text-white p-2 flex justify-between items-center rounded-t-lg">
        <h2 className="text-lg font-bold">Evrlink Assistant</h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => toggleOfflineMode()}
            className="text-white hover:text-gray-200 transition-colors px-3 py-1 rounded"
            title={isOfflineMode ? "Go Online" : "Go Offline"}
          >
            {isOfflineMode ? "Go Online" : "Go Offline"}
          </button>
          <button
            onClick={onMinimize}
            className="text-white hover:text-gray-200 transition-colors"
            title="Minimize"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <button
            onClick={onClose}
            className="text-xs bg-blue-700 hover:bg-blue-800 px-2 py-1 rounded"
            title="Close chat"
          >
            Close
          </button>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-grow overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center">
            <p className="text-gray-500 mb-4">
              {isOfflineMode 
                ? "Offline mode: Ask common questions about Evrlink..."
                : "Chat with the Evrlink Assistant..."}
            </p>
            {isOfflineMode && (
              <div className="flex flex-wrap justify-center gap-2">
                {SUGGESTED_QUESTIONS.map((question, index) => (
                  <SuggestedQuestion
                    key={index}
                    question={question}
                    onClick={onSendMessage}
                    disabled={isThinking}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`p-3 rounded-2xl shadow ${
                  msg.sender === "user"
                    ? "bg-blue-600 text-white self-end"
                    : "bg-gray-100 dark:bg-gray-700 self-start"
                }`}
              >
                <ReactMarkdown
                  components={{
                    a: props => (
                      <a
                        {...props}
                        className="text-blue-200 underline hover:text-blue-100"
                        target="_blank"
                        rel="noopener noreferrer"
                      />
                    ),
                    p: props => (
                      <p {...props} className="whitespace-pre-wrap" />
                    ),
                    code: props => (
                      <code {...props} className="bg-gray-800 text-gray-200 px-1 rounded" />
                    ),
                  }}
                >
                  {msg.text}
                </ReactMarkdown>
              </div>
            ))}
            {/* Show suggested questions after each agent response in offline mode */}
            {isOfflineMode && messages.length > 0 && messages[messages.length - 1].sender === "agent" && (
              <div className="flex flex-wrap justify-center gap-2 mt-4 p-2 bg-gray-50 rounded-lg">
                {SUGGESTED_QUESTIONS.map((question, index) => (
                  <SuggestedQuestion
                    key={index}
                    question={question}
                    onClick={onSendMessage}
                    disabled={isThinking}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Thinking Indicator */}
        {isThinking && (
          <div className="text-right mr-2 text-gray-500 italic">
            🤖 Thinking...
          </div>
        )}

        {/* Invisible div to track the bottom */}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <div className="p-4 border-t dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            className="flex-grow p-2 rounded border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder={isThinking ? "Please wait..." : "Type a message..."}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Enter" && !isThinking && input.trim()) {
                onSendMessage(input);
              }
            }}
            disabled={isThinking}
          />
          <button
            onClick={() => {
              if (!isThinking && input.trim()) {
                onSendMessage(input);
              }
            }}
            className={`px-6 py-2 rounded-full font-semibold transition-all ${
              !input.trim() || isThinking
                ? "bg-gray-300 cursor-not-allowed text-gray-500"
                : "bg-blue-600 hover:bg-blue-700 text-white shadow-md"
            }`}
            disabled={!input.trim() || isThinking}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};
