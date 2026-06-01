interface CountDisplayProps {
  isLoading?: boolean;
  count: number;
}

export default function CountDisplay({ isLoading = false, count }: CountDisplayProps) {
  return (
    <span className="text-[12px] font-normal text-muted-foreground tabular-nums">({isLoading ? "…" : count})</span>
  );
}
