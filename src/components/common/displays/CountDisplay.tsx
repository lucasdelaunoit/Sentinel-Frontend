interface CountDisplayProps {
  count: number;
}

export default function CountDisplay({ count }: CountDisplayProps) {
  return <span className="text-[12px] font-normal text-muted-foreground tabular-nums">({count})</span>;
}

CountDisplay.Skeleton = function CountDisplaySkeleton() {
  return <span className="text-[12px] font-normal text-muted-foreground tabular-nums">(…)</span>;
};
