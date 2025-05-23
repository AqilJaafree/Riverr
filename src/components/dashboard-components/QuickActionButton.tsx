// src/components/dashboard-components/QuickActionButtons.tsx
"use client";

import React from 'react';
import { Button } from "@/components/ui/button";

interface QuickActionButtonsProps {
  onQuickAction: (question: string) => void;
  disabled?: boolean;
}

const QuickActionButtons: React.FC<QuickActionButtonsProps> = ({ 
  onQuickAction,
  disabled = false 
}) => {
  // Quick action questions
  const quickActions = [
    { text: "What is Pool?", prompt: "What is a liquidity pool and how does it work in DeFi?" },
    { text: "Why Sui with BTC?", prompt: "Why is Sui a good blockchain for BTC liquidity and what are the advantages?" },
    { text: "What is risk involve?", prompt: "What are the risks involved with providing liquidity in BTC pools?" },
    { text: "What is LP?", prompt: "What is LP (Liquidity Provider) and how do LP tokens work?" }
  ];

  // Handle click - sends the prompt immediately
  const handleQuickActionClick = (prompt: string) => {
    onQuickAction(prompt);
  };

  return (
    <div className="w-[300px] md:w-full overflow-hidden flex ">
      <div className="flex overflow-x-auto scrollbar-hide gap-2 mb-3">
      {quickActions.map((action, index) => (
        <Button
          key={index}
          variant="secondary"
          size="secondary"
          disabled={disabled}
          onClick={() => handleQuickActionClick(action.prompt)}
        >
          {action.text}
        </Button>
      ))}
    </div>
    </div>
  );
};

export default QuickActionButtons;