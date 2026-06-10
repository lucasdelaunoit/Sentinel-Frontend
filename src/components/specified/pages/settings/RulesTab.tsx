import DefaultRulesContainer from "./rulesTab/DefaultRulesContainer";
import ComposedCard from "@/components/common/cards/ComposedCard";
import Feedback from "@/components/common/feedbacks/Feedback";

export default function RulesTab() {
  return (
    <div className="space-y-5">
      <DefaultRulesContainer />

      <ComposedCard title="Custom extra rules">
        <Feedback
          variant="info"
          title="Custom rules are disabled for now"
          description="Creating and managing custom resilience rules is temporarily unavailable. The plain-English rules above remain active."
          className="py-12"
        />
      </ComposedCard>
    </div>
  );
}
