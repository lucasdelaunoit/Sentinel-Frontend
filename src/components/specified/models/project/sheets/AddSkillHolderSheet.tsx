import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { Field, FieldLabel, FieldDescription } from "@/components/ui/field.tsx";
import ComposedSheet from "@/components/common/sheets/ComposedSheet.tsx";
import SelectorList from "@/components/common/inputs/SelectorList.tsx";
import SelectorRow from "@/components/common/inputs/SelectorRow.tsx";
import SkillLevelPicker from "@/components/specified/models/skill/items/SkillLevelPicker.tsx";
import UserAvatar from "@/components/specified/models/user/avatars/UserAvatar.tsx";
import useGetProjectUsers from "@/api/projects/useGetProjectUsers.ts";
import useAttachSkillToUser from "@/api/user/useAttachSkillToUser.ts";
import { HighlightMatch } from "@/utils/useHighlightableText.tsx";
import { getFullName } from "@/utils/formatters/persons.ts";

export interface HolderSheetSkill {
  id: number;
  name: string;
  category: string;
}

interface AddSkillHolderSheetProps {
  projectId: string | undefined;
  skill: HolderSheetSkill | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AddSkillHolderSheet({ projectId, skill, open, onOpenChange }: AddSkillHolderSheetProps) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [picked, setPicked] = useState<number | null>(null);
  const [level, setLevel] = useState<number | null>(null);

  const { data: members, isLoading: membersLoading } = useGetProjectUsers(projectId, {
    per_page: 50,
    search: search || undefined,
  });
  const { attachSkillToUser, isLoading: attaching } = useAttachSkillToUser();

  // Only team members who don't already hold this skill — adding them improves coverage.
  const candidates = useMemo(
    () => members.filter((m) => !m.skills?.some((s) => s.id === skill?.id)),
    [members, skill?.id],
  );

  useEffect(() => {
    if (open) {
      setSearch("");
      setPicked(null);
      setLevel(null);
    }
  }, [open]);

  function close() {
    setSearch("");
    setPicked(null);
    setLevel(null);
    onOpenChange(false);
  }

  function select(id: number) {
    setPicked((prev) => (prev === id ? null : id));
  }

  async function submit() {
    if (!projectId || !skill || picked === null || level === null) return;
    try {
      await attachSkillToUser({ userId: picked, skillId: skill.id, level });
      queryClient.invalidateQueries({ queryKey: ["projects", projectId, "knowledge-coverage"] });
      queryClient.invalidateQueries({ queryKey: ["projects", projectId, "competency-radar"] });
      queryClient.invalidateQueries({ queryKey: ["projects", projectId, "users"] });
      toast.success("Skill assigned.");
      close();
    } catch {
      /* hook toasts */
    }
  }

  const canSubmit = picked !== null && level !== null && !attaching;

  return (
    <ComposedSheet
      open={open}
      onOpenChange={(v) => {
        if (!v) close();
      }}
      title="Add someone with this skill"
      description={
        skill ? (
          <>
            Assign <span className="font-semibold text-foreground">{skill.name}</span> to a team member
          </>
        ) : undefined
      }
      maxWidth="sm:max-w-[520px]"
      footer={
        <>
          <Button variant="outline" onClick={close} className="flex-1" disabled={attaching} size="lg">
            Cancel
          </Button>
          <Button onClick={submit} disabled={!canSubmit} loading={attaching} className="flex-1" size="lg">
            {attaching ? "Saving…" : "Assign skill"}
          </Button>
        </>
      }
    >
      <Field>
        <FieldLabel>
          Team member <span className="text-destructive-foreground">*</span>
        </FieldLabel>
        <SelectorList
          items={candidates}
          renderItem={(m) => (
            <SelectorRow key={m.id} active={picked === m.id} onClick={() => select(m.id)}>
              <UserAvatar firstname={m.firstname} lastname={m.lastname} variant={m.status} size="base" />
              <span className="flex-1 text-[13px] font-semibold text-foreground truncate">
                <HighlightMatch text={getFullName(m.firstname, m.lastname)} searchTerm={search} />
              </span>
              {m.department?.name && (
                <span className="text-[11.5px] text-muted-foreground shrink-0">{m.department.name}</span>
              )}
            </SelectorRow>
          )}
          renderSkeleton={() => <SelectorRowSkeleton />}
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search team members..."
          isLoading={membersLoading}
          emptyMessage="Every team member already holds this skill, or the team is empty. Add a member from the Team tab first."
          maxHeight="max-h-[44vh]"
        />
        <FieldDescription>Only project members who don't already hold this skill are shown</FieldDescription>
      </Field>

      <Field>
        <FieldLabel>
          Proficiency level <span className="text-destructive-foreground">*</span>
        </FieldLabel>
        <SkillLevelPicker value={level} onChange={setLevel} disabled={attaching} />
        <FieldDescription>From beginner (1) to expert (5)</FieldDescription>
      </Field>
    </ComposedSheet>
  );
}

function SelectorRowSkeleton() {
  return (
    <div className="flex items-center gap-3 px-3.5 py-2.5">
      <Skeleton className="size-6 rounded-md shrink-0" />
      <UserAvatar.Skeleton size="base" />
      <Skeleton className="h-3.5 flex-1 max-w-[40%]" />
      <Skeleton className="h-3 w-20 shrink-0" />
    </div>
  );
}
