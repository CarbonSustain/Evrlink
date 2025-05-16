import React from "react";
import { ChatUI } from "./ChatUI";

type AgentChatProps = {
  userId?: string;
};

export const AgentChat = ({ userId }: AgentChatProps = {}) => {

  return <ChatUI isMinimized={false} onMinimize={() => {}} />;
};