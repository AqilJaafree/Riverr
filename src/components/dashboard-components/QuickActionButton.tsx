// src/components/dashboard-components/QuickActionButton.tsx
"use client";

import React from 'react';
import { Button } from "@/components/ui/button";

interface QuickActionButtonsProps {
  onQuickAction: (question: string) => void;
  onAddLiquidity: () => void; // New callback for "Add Liquidity" action
  disabled?: boolean;
}

const QuickActionButtons: React.FC<QuickActionButtonsProps> = ({ 
  onQuickAction,
  onAddLiquidity,
  disabled = false 
}) => {
  // Quick action questions
  const quickActions = [
    { text: "What is Pool?", prompt: "What is a liquidity pool and how does it work in DeFi?" },
    { text: "Why Solana with BTC?", prompt: "Why is Solana a good blockchain for BTC liquidity and what are the advantages?" },
    { text: "What is risk involve?", prompt: "What are the risks involved with providing liquidity in BTC pools?" },
    { text: "What is LP?", prompt: "What is LP (Liquidity Provider) and how do LP tokens work?" }
  ];

  // Handle click - sends the prompt immediately
  const handleQuickActionClick = (prompt: string) => {
    onQuickAction(prompt);
  };

  return (
    <div className="flex flex-wrap gap-2 justify-start items-start mb-2">
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
      
      {/* New Add Liquidity button */}
      <Button
        variant="gradient"
        size="secondary"
        disabled={disabled}
        onClick={onAddLiquidity}
      >
        Add Liquidity
      </Button>
    </div>
  );
};

export default QuickActionButtons;