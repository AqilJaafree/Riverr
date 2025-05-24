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
import AddLiquidityDialog from "../AddLiquidityDialog";

// Add a new interface to associate messages with pools
interface MessageWithPool {
  message: ChatMessageType;
  portfolioStyle?: string | null;
}

const ChatBox = () => {
  const [showWelcome, setShowWelcome] = useState(true);
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [messagesWithPools, setMessagesWithPools] = useState<MessageWithPool[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isPortfolioStyleModalOpen, setIsPortfolioStyleModalOpen] =
    useState(false);
  const [selectedPortfolioStyle, setSelectedPortfolioStyle] = useState<
    string | null
  >(null);
  const [isLPModalOpen, setIsLPModalOpen] = useState(false);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messagesWithPools]);

  // Exit welcome screen when portfolio style is selected
  useEffect(() => {
    if (selectedPortfolioStyle) {
      setShowWelcome(false);
      
      // Add welcome message when style is selected
      const welcomeMessage: ChatMessageType = { 
        role: "assistant" as const, 
        content: `Welcome! You've selected the ${selectedPortfolioStyle.charAt(0).toUpperCase() + selectedPortfolioStyle.slice(1)} portfolio style. I'll recommend pools that match your risk preference. \n\nHere's a pool. This pool offers high potential returns with managed risk.`
      };
      
      setMessages(prev => [...prev, welcomeMessage]);
      setMessagesWithPools(prev => [...prev, { 
        message: welcomeMessage, 
        portfolioStyle: selectedPortfolioStyle 
      }]);
    }
  }, [selectedPortfolioStyle]);

  const handleSend = async () => {
    if (input.trim()) {
      if (showWelcome) {
        setShowWelcome(false);
      }

      setIsLoading(true);
      const userMessage: ChatMessageType = { role: "user", content: input };
      setMessages((prev) => [...prev, userMessage]);
      setMessagesWithPools(prev => [...prev, { message: userMessage }]);
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
        
        const assistantMessage: ChatMessageType = { role: "assistant" as const, content: response };
        setMessages((prev) => [...prev, assistantMessage]);
        setMessagesWithPools(prev => [...prev, { message: assistantMessage }]);
      } catch (error) {
        console.error("Error getting response:", error);
        const errorMessage: ChatMessageType = { 
          role: "assistant" as const, 
          content: "I'm sorry, I encountered an error processing your request. Please try again later."
        };
        setMessages((prev) => [...prev, errorMessage]);
        setMessagesWithPools(prev => [...prev, { message: errorMessage }]);
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
            Select Profile Style
          </Button>
        </div>

        {/* Chat input area for welcome screen */}
        <div className="w-full">
          <QuickActionButtons onQuickAction={(query) => {
            setInput(query);
            handleSend();
          }} 
          disabled={isLoading} />
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
        
        {/* Add Liquidity Modal - Using shared component */}
        <AddLiquidityDialog
          isOpen={isLPModalOpen}
          onClose={() => setIsLPModalOpen(false)}
          portfolioStyle={selectedPortfolioStyle}
          onSelectStyle={setSelectedPortfolioStyle}
          onAskHelp={(question) => {
            setInput(question);
            handleSend();
          }}
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
      
      {/* Scrollable chat messages area */}
      <div className="flex-1 overflow-y-auto lg:pb-8 pb-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
        <div className="space-y-6 p-4">
          {messagesWithPools.map((item, index) => (
            <div key={index}>
              <ChatMessage message={item.message} />
              
              {/* Display pool recommendation after certain assistant messages if we have a portfolioStyle */}
              {item.message.role === "assistant" && 
               item.portfolioStyle && (
                <div className="mt-4">
                  <RecommendedPool portfolioStyle={item.portfolioStyle} />
                  {/* Add Liquidity button - commented out since it's now included in RecommendedPool
                  <Button
                    variant="gradient"
                    size="gradient"
                    className="w-full mt-2"
                    onClick={() => setIsLPModalOpen(true)}
                  >
                    <PlusIcon size={20} />
                    Add Liquidity to {item.portfolioStyle.charAt(0).toUpperCase() + item.portfolioStyle.slice(1)} Pool
                  </Button>
                  */}
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Fixed chat input area */}
      <div className="w-full">
        <QuickActionButtons onQuickAction={(query) => {
          setInput(query);
          handleSend();
        }} 
        disabled={isLoading} />
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

{/* Add Liquidity Modal */}
{/* <Dialog open={isLPModalOpen} onOpenChange={setIsLPModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Liquidity to Pool</DialogTitle>
            <DialogDescription>
              Select your preferred investment style to add liquidity
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-4">

            <div className="grid grid-cols-3 gap-2">
              <Button
                variant="outline" 
                className={selectedPortfolioStyle === "conservative" ? "border-primary" : ""}
                onClick={() => setSelectedPortfolioStyle("conservative")}
              >
                Conservative
              </Button>
              <Button
                variant="outline"
                className={selectedPortfolioStyle === "moderate" ? "border-primary" : ""}
                onClick={() => setSelectedPortfolioStyle("moderate")}
              >
                Moderate
              </Button>
              <Button
                variant="outline"
                className={selectedPortfolioStyle === "aggressive" ? "border-primary" : ""}
                onClick={() => setSelectedPortfolioStyle("aggressive")}
              >
                Aggressive
              </Button>
            </div>
            
          
            {selectedPortfolioStyle && (
              <LPIntegration portfolioStyle={selectedPortfolioStyle} />
            )}
            
     
            <Button 
              variant="link"
              onClick={() => {
                setInput("How do I provide liquidity to a pool?");
                handleSend();
                setIsLPModalOpen(false);
              }}
            >
              Need help? Ask the assistant
            </Button>
          </div>
        </DialogContent>
      </Dialog> */}
      {/* Add Liquidity Modal - Using shared component */}
      <AddLiquidityDialog
        isOpen={isLPModalOpen}
        onClose={() => setIsLPModalOpen(false)}
        portfolioStyle={selectedPortfolioStyle}
        onSelectStyle={setSelectedPortfolioStyle}
        onAskHelp={(question) => {
          setInput(question);
          handleSend();
        }}
      />
    </div>
  );
};

export default ChatBox;