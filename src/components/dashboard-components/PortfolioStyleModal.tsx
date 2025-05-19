// src/components/dashboard-components/PortfolioStyleModal.tsx
"use client";

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface PortfolioStyleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectStyle: (style: string) => void;
}

type PortfolioStyle = {
  id: string;
  title: string;
  description: string;
  icon?: string; // Optional icon character
};

const PortfolioStyleModal: React.FC<PortfolioStyleModalProps> = ({ 
  isOpen, 
  onClose,
  onSelectStyle
}) => {
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  
  const portfolioStyles: PortfolioStyle[] = [
    {
      id: 'conservative',
      title: 'Conservative',
      description: 'Protect your capital by focusing on stable, audited pools-lower risk, safe but smaller returns.',
      icon: '🛡️'
    },
    {
      id: 'moderate',
      title: 'Moderate',
      description: 'Balance growth and stability using a mix of established and growth pools-moderate risk, steadier returns.',
      icon: '⚖️'
    },
    {
      id: 'aggressive',
      title: 'Aggressive',
      description: 'Maximize returns with higher-yield, more volatile pools-expect bigger ups and downs.',
      icon: '🚀'
    }
  ];
  
  const handleStyleSelect = (styleId: string) => {
    setSelectedStyle(styleId);
  };
  
  const handleConfirm = () => {
    if (selectedStyle) {
      onSelectStyle(selectedStyle);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogTitle className='text-center text-2xl font-bold'>Choose Your Portfolio Style</DialogTitle>
        {/* Modal Content */}
        <div className='pt-8'>  
          {/* Subtitle */}
          <div className="mb-6 flex flex-col items-start ">
            <h3 className="text-md white mb-2">Select Your Preferred Investment Style</h3>
            <p className="text-sm text-sub-text">
              Choose how you want to grow your portfolio. Your selection helps us recommend the best liquidity pools for your risk comfort and goals.
            </p>
          </div>
          
          {/* Options */}
          <div className="space-y-3 mb-8">
            {portfolioStyles.map((style) => {
              const isSelected = selectedStyle === style.id;
              
              return (
                <div
                  key={style.id}
                  className={`cursor-pointer rounded-2xl border px-5 py-4 transition-all ${
                    isSelected ? "bg-primary border-primary" : "bg-transparent border-primary"
                  }`}
                  onClick={() => handleStyleSelect(style.id)}
                >
                  <div className="flex items-center">
                    <div className="flex-1">
                      <div className="flex items-center">
                        {style.icon && <span className="mr-2">{style.icon}</span>}
                        <h3 className="font-medium text-white">
                          {style.title}
                        </h3>
                      </div>
                      <p className="text-sm text-white mt-1">
                        {style.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Continue Button */}
            <Button
              variant="default"
              onClick={handleConfirm}
              disabled={!selectedStyle}
              className="w-full"
            >
              Continue
            </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PortfolioStyleModal;