import { Badge } from "@/components/ui/badge.tsx";
import { TONE_SOLID_BADGE } from "@/lib/theme/tone.ts";

export default function RecurringBadge() {
  return <Badge className={TONE_SOLID_BADGE.neutral}>Recurring</Badge>;
}
