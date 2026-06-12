import { type ReactNode } from "react";

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Renders `text` with the first case-insensitive `searchTerm` match highlighted. */
export function HighlightMatch({ text, searchTerm }: { text: string; searchTerm: string }): ReactNode {
  if (!searchTerm || !searchTerm.trim()) return <span>{text}</span>;

  const regex = new RegExp(`(${escapeRegExp(searchTerm)})`, "i");
  const parts = text.split(regex);

  return (
    <span>
      {parts.map((part, index) =>
        part.toLowerCase() === searchTerm.toLowerCase() ? (
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
