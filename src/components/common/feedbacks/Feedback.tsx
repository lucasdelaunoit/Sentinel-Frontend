import { cn } from "@/lib/utils.ts";
import { CheckIcon, InfoIcon, QuestionIcon, WarningIcon, XIcon } from "@phosphor-icons/react";
import { type ElementType, type ReactNode } from "react";

type FeedbackVariant = "success" | "warning" | "danger" | "info" | "neutral";

const VARIANTS: Record<FeedbackVariant, { icon: ElementType; foreground: string }> = {
  success: { icon: CheckIcon, foreground: "text-success" },
  warning: { icon: WarningIcon, foreground: "text-warning" },
  danger: { icon: XIcon, foreground: "text-danger" },
  info: { icon: InfoIcon, foreground: "text-info" },
  neutral: { icon: QuestionIcon, foreground: "text-neutral" },
};

interface FeedbackProps {
  title: string;
  description?: string;
  variant?: FeedbackVariant;
  icon?: ReactNode;
  className?: string;
  action?: ReactNode;
}

export default function Feedback({
  title,
  description,
  variant = "neutral",
  icon: Icon,
  className,
  action,
}: FeedbackProps) {
  const VariantIcon = VARIANTS[variant].icon;

  return (
    <div className={cn("flex flex-col items-center justify-center gap-3 text-center", className)}>
      <div className={cn("flex items-center justify-center rounded-full mb-1")}>
        <span>{Icon ? <Icon /> : <VariantIcon className={cn(VARIANTS[variant].foreground, "size-6")} />}</span>
      </div>
      <div className="mb-1">
        <p className={cn("text-sm font-semibold", VARIANTS[variant].foreground)}>{title}</p>
        {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
      </div>
      {action}
    </div>
  );
}
