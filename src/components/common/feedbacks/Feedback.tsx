import { cn } from "@/lib/utils.ts";
import { type Tone, TONE_TEXT } from "@/lib/theme/tone.ts";
import { CheckIcon, InfoIcon, QuestionIcon, WarningIcon, XIcon } from "@phosphor-icons/react";
import { type ElementType, type ReactNode } from "react";

type FeedbackVariant = Tone;

const VARIANT_ICON: Record<FeedbackVariant, ElementType> = {
  success: CheckIcon,
  warning: WarningIcon,
  danger: XIcon,
  info: InfoIcon,
  neutral: QuestionIcon,
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
  icon,
  className,
  action,
}: FeedbackProps) {
  const VariantIcon = VARIANT_ICON[variant];

  return (
    <div className={cn("flex flex-col items-center justify-center gap-3 text-center", className)}>
      <div className={cn("flex items-center justify-center rounded-full mb-1")}>
        <span>{icon ?? <VariantIcon className={cn(TONE_TEXT[variant], "size-6")} />}</span>
      </div>
      <div className="mb-1">
        <p className={cn("text-sm font-semibold", TONE_TEXT[variant])}>{title}</p>
        {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
      </div>
      {action}
    </div>
  );
}
