interface ChatMessageProps {
    message: {
      role: "user" | "assistant"
      content: string
    }
  }
  
  export default function ChatMessage({ message }: ChatMessageProps) {
    // Format the content to properly display numbered lists
    const formatContent = (content: string) => {
      // First, split content into paragraphs (separated by double newlines)
      const paragraphs = content.split('\n\n');
      
      return paragraphs.map((paragraph, paragraphIndex) => {
        // Check if this paragraph might be a numbered list
        const lines = paragraph.split('\n');
        const hasNumberedLines = lines.some(line => line.match(/^\s*\d+\.\s/));
        
        if (hasNumberedLines) {
          // Process as a numbered list
          return (
            <div key={`p-${paragraphIndex}`} className="mb-4">
              {lines.map((line, lineIndex) => {
                const listItemMatch = line.match(/^\s*(\d+)\.\s(.+)$/);
                
                if (listItemMatch) {
                  return (
                    <div key={`list-${paragraphIndex}-${lineIndex}`} className="flex ml-4 mb-2">
                      <span className="mr-2 font-bold">{listItemMatch[1]}.</span>
                      <span>{listItemMatch[2]}</span>
                    </div>
                  );
                }
                
                // Regular line within a list paragraph
                return line.trim() ? 
                  <div key={`line-${paragraphIndex}-${lineIndex}`} className="mb-2">{line}</div> : 
                  <div key={`space-${paragraphIndex}-${lineIndex}`} className="h-2"></div>;
              })}
            </div>
          );
        }
        
        // Regular paragraph, not a list
        return (
          <div key={`para-${paragraphIndex}`} className="mb-4">
            {paragraph}
          </div>
        );
      });
    };
  
    if (message.role === "assistant") {
      return (
        <div className="flex gap-3">
          <div className="max-w-full">{formatContent(message.content)}</div>
        </div>
      )
    }
  
    return (
      <div className="flex flex-row-reverse gap-3">
        <div className="bg-white/10 rounded-full py-2 px-4 max-w-full">{message.content}</div>
      </div>
    )
  }
  