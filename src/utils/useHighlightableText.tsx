import { ReactNode } from "react";

export default function useHighlightableText(text: string, highlightedPart: string) {
  function escapeRegExp(str: string) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  if (!highlightedPart || !highlightedPart.trim()) return <span>{text}</span>;

  const escaped = escapeRegExp(highlightedPart);
  const regex = new RegExp(`(${escaped})`, "i");
  const parts = text.split(regex);

  return (
    <span>
      {parts.map((part, index) =>
        part.toLowerCase() === highlightedPart.toLowerCase() ? (
          <mark key={index} className="bg-yellow-200 dark:bg-yellow-800/60 rounded-sm">
            {part}
          </mark>
        ) : (
          <span key={index}>{part}</span>
        ),
      )}
    </span>
  );
}

export function HighlightMatch({ text, searchTerm }: { text: string; searchTerm: string }): ReactNode {
  return useHighlightableText(text, searchTerm);
}
