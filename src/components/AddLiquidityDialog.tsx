"use client";

import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import LPIntegration from "@/components/dashboard-components/LPIntegration";

interface AddLiquidityDialogProps {
  isOpen: boolean;
  onClose: () => void;
  portfolioStyle: string | null;
  onSelectStyle: (style: string) => void;
  onAskHelp?: (question: string) => void;
}

const AddLiquidityDialog: React.FC<AddLiquidityDialogProps> = ({
  isOpen,
  onClose,
  portfolioStyle,
  onSelectStyle,
  onAskHelp
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Liquidity to Pool</DialogTitle>
          <DialogDescription>
            Select your preferred investment style to add liquidity
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
          {/* Portfolio style buttons */}
          <div className="grid grid-cols-3 gap-2">
            <Button
              variant="outline" 
              className={portfolioStyle === "conservative" ? "border-primary" : ""}
              onClick={() => onSelectStyle("conservative")}
            >
              Conservative
            </Button>
            <Button
              variant="outline"
              className={portfolioStyle === "moderate" ? "border-primary" : ""}
              onClick={() => onSelectStyle("moderate")}
            >
              Moderate
            </Button>
            <Button
              variant="outline"
              className={portfolioStyle === "aggressive" ? "border-primary" : ""}
              onClick={() => onSelectStyle("aggressive")}
            >
              Aggressive
            </Button>
          </div>
          
          {/* Display the selected pool using existing LPIntegration */}
          {portfolioStyle && (
            <LPIntegration portfolioStyle={portfolioStyle} />
          )}
          
          {/* Help button */}
          {onAskHelp && (
            <Button 
              variant="link"
              onClick={() => {
                onAskHelp("How do I provide liquidity to a pool?");
                onClose();
              }}
            >
              Need help? Ask the assistant
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddLiquidityDialog; 