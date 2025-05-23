"use client";

import { useState, useRef, useEffect } from "react";
import {
  ChartLineUpIcon,
  ClockIcon,
  PlusIcon,
  WalletIcon,
} from "@phosphor-icons/react";
import ChatMessage from "../chat-message";
import ChatInput from "../chat-input";
import QuickActionButtons from "./QuickActionButton";
import PortfolioStyleModal from "./PortfolioStyleModal";
import RecommendedPool from "../RecommendedPool";
import { Button } from "../ui/button";
import { anthropicService } from "@/services/anthropic";
import { ChatMessage as ChatMessageType } from "@/types/anthropic";
import { CHAT_CONFIG } from "@/config";

const ChatBox = () => {
  const [showWelcome, setShowWelcome] = useState(true);
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isPortfolioStyleModalOpen, setIsPortfolioStyleModalOpen] =
    useState(false);
  const [selectedPortfolioStyle, setSelectedPortfolioStyle] = useState<
    string | null
  >(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (input.trim()) {
      if (showWelcome) {
        setShowWelcome(false);
      }

      setIsLoading(true);
      const userMessage: ChatMessageType = { role: "user", content: input };
      setMessages((prev) => [...prev, userMessage]);
      setInput("");

      try {
        // Format the context message about Riverr
        const contextMessage = {
          role: "user" as const,
          content: CHAT_CONFIG.initialPrompt
        };
        
        // Format the conversation history for Anthropic
        const conversationHistory = [
          contextMessage,
          ...messages,
          userMessage
        ];

        // Get response from Anthropic
        const response = await anthropicService.sendMessage(conversationHistory);
        
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: response }
        ]);
      } catch (error) {
        console.error("Error getting response:", error);
        setMessages((prev) => [
          ...prev,
          { 
            role: "assistant", 
            content: "I'm sorry, I encountered an error processing your request. Please try again later."
          }
        ]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (showWelcome) {
    return (
      <div className="flex flex-col h-[calc(100vh-100px)] lg:max-w-4xl mx-auto">
        <div className="flex-1 flex flex-col items-center justify-start p-6 lg:mt-14">
          <span>Welcome to Riverr</span>
          <h1 className="lg:text-4xl md:text-2xl text-xl font-bold text-gradient text-center md:w-[60%] mt-2 mb-6">
            Explore BTC liquidity on Sui fast, smart, and secure.
          </h1>
          <div className="flex flex-col lg:gap-4 gap-2">
            <div className="flex flex-col lg:grid grid-cols-2 lg:gap-6 gap-2">
              <p className="flex items-center gap-2">
                <ClockIcon className="text-primary" size={20} /> Discover wBTC
                pools in real time
              </p>
              <p className="flex items-center gap-2">
                <PlusIcon className="text-primary" size={20} /> Instantly add
                liquidity
              </p>
            </div>
            <div className="flex flex-col lg:grid grid-cols-2 lg:gap-6 gap-2">
              <p className="flex items-center gap-2">
                <ChartLineUpIcon className="text-primary" size={20} /> Track
                TVL, APR & trends
              </p>
              <p className="flex items-center gap-2">
                <WalletIcon className="text-primary" size={20} /> Secure wallet
                integration
              </p>
            </div>
          </div>
          <Button
            variant="gradient"
            size="gradient"
            className="mt-10"
            onClick={() => setIsPortfolioStyleModalOpen(true)}
          >
            <ChartLineUpIcon size={20} /> 
            {selectedPortfolioStyle ? `Profile: ${selectedPortfolioStyle.charAt(0).toUpperCase() + selectedPortfolioStyle.slice(1)}` : "Select Profile Style"}
          </Button>
          
          {/* Display recommended pool if portfolio style is selected */}
          {selectedPortfolioStyle && (
            <RecommendedPool portfolioStyle={selectedPortfolioStyle} />
          )}
        </div>

        {/* Chat input area for welcome screen */}
        <div className="w-full">
          <QuickActionButtons onQuickAction={(query) => {
            setInput(query);
            handleSend();
          }} />
          <ChatInput
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            onSend={handleSend}
            isLoading={isLoading}
          />
        </div>
        <PortfolioStyleModal
          isOpen={isPortfolioStyleModalOpen}
          onClose={() => setIsPortfolioStyleModalOpen(false)}
          onSelectStyle={setSelectedPortfolioStyle}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] lg:max-w-4xl mx-auto">
      <div className="flex justify-end">
        <Button
          variant="gradient"
          size="gradient"
          className="lg:mt-10"
          onClick={() => setIsPortfolioStyleModalOpen(true)}
        >
          <ChartLineUpIcon size={20} /> 
          {selectedPortfolioStyle ? `Profile: ${selectedPortfolioStyle.charAt(0).toUpperCase() + selectedPortfolioStyle.slice(1)}` : "Select Profile Style"}
        </Button>
      </div>
      
      {/* Display recommended pool if portfolio style is selected */}
      {selectedPortfolioStyle && (
        <RecommendedPool portfolioStyle={selectedPortfolioStyle} />
      )}

      {/* Scrollable chat messages area */}
      <div className="flex-1 overflow-y-auto lg:pb-8 pb-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
        <div className="space-y-6 p-4">
          {messages.map((message, index) => (
            <ChatMessage key={index} message={message} />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Fixed chat input area */}
      <div className="w-full">
        <QuickActionButtons onQuickAction={(query) => {
          setInput(query);
          handleSend();
        }} />
        <ChatInput
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          onSend={handleSend}
          isLoading={isLoading}
        />
      </div>

      <PortfolioStyleModal
        isOpen={isPortfolioStyleModalOpen}
        onClose={() => setIsPortfolioStyleModalOpen(false)}
        onSelectStyle={setSelectedPortfolioStyle}
      />
    </div>
  );
};

export default ChatBox;