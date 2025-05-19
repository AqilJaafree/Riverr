import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { Loader2, } from "lucide-react";
import { ArrowUpIcon } from "@phosphor-icons/react";

interface ChatInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  disabled: boolean;
  onSend: () => void;
  isLoading: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({
  value,
  onChange,
  onKeyDown,
  disabled,
  onSend,
  isLoading,
}) => {
  return (
    <div className="flex space-x-2">
      <Textarea
        placeholder="Type your message here..."
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        className="text-white"
        disabled={disabled}
      />
      <Button
        variant="icon"
        size="icon"
        onClick={onSend}
        disabled={disabled || !value.trim()}
        className="self-end"
      >
        {isLoading ? (
          <div className="flex items-center justify-center">
            <Loader2 className="animate-spin" />
          </div>
        ) : (
          <div className="flex items-center justify-center">
            <ArrowUpIcon size={20} />
          </div>
        )}
      </Button>
    </div>
  );
};

export default ChatInput; 