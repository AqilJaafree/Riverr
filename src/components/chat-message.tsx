interface ChatMessageProps {
    message: {
      role: "user" | "assistant"
      content: string
    }
  }
  
  export default function ChatMessage({ message }: ChatMessageProps) {
    if (message.role === "assistant") {
      return (
        <div className="flex gap-3">
          <div className="max-w-full">{message.content}</div>
        </div>
      )
    }
  
    return (
      <div className="flex flex-row-reverse gap-3">
        <div className="bg-white/10 rounded-full py-2 px-4 max-w-full">{message.content}</div>
      </div>
    )
  }
  