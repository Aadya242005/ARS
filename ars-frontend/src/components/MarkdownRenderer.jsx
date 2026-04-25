import React from 'react';

export default function MarkdownRenderer({ content, className = "" }) {
  if (!content) return null;

  const lines = content.split('\n');

  return (
    <div className={`space-y-1.5 ${className}`}>
      {lines.map((line, i) => {
        if (!line.trim()) return <div key={i} className="h-2" />;

        // Handle ## or ### Headings if they exist
        let parsedLine = line;
        let isMarkdownHeading = false;
        if (line.startsWith('### ')) {
          parsedLine = line.replace('### ', '');
          isMarkdownHeading = true;
        } else if (line.startsWith('## ')) {
          parsedLine = line.replace('## ', '');
          isMarkdownHeading = true;
        } else if (line.startsWith('# ')) {
          parsedLine = line.replace('# ', '');
          isMarkdownHeading = true;
        }

        // Bold formatting
        const parts = parsedLine.split(/(\*\*.*?\*\*)/g);
        
        // Treat lines that are exclusively bold as headings
        const isBoldHeading = parts.length === 3 && parts[0].trim() === "" && parts[2].trim() === "";
        const isHeading = isMarkdownHeading || isBoldHeading;

        const formatted = parts.map((part, idx) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            const text = part.slice(2, -2);
            if (isHeading) {
              return (
                <span key={idx} className="block text-sm font-bold uppercase tracking-wider text-current mt-4 mb-2 border-b border-current/10 pb-1 opacity-90">
                  {text}
                </span>
              );
            }
            return (
              <strong key={idx} className="font-semibold text-current opacity-100">
                {text}
              </strong>
            );
          }
          
          if (isHeading && part.trim().length > 0 && !part.startsWith('**')) {
             return (
               <span key={idx} className="block text-sm font-bold uppercase tracking-wider text-current mt-4 mb-2 border-b border-current/10 pb-1 opacity-90">
                 {part}
               </span>
             );
          }
          return part;
        });

        // Simple check for list items (1., -, •)
        const isListItem = /^(?:\d+\.|\-|\•)\s/.test(parsedLine.trim());

        return (
          <div key={i} className={`${isListItem ? "pl-4 relative before:content-[''] before:absolute before:left-1 before:top-2 before:w-1 before:h-1 before:bg-current before:opacity-40 before:rounded-full" : ""}`}>
            {formatted}
          </div>
        );
      })}
    </div>
  );
}
