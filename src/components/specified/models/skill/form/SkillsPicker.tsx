import { useMemo } from "react";
import { XIcon } from "@phosphor-icons/react";
import { Field, FieldLabel, FieldDescription } from "@/components/ui/field";
import SelectorList from "@/components/common/inputs/SelectorList";
import LevelPicker from "@/components/common/inputs/LevelPicker";
import SkillSelectorRow from "@/components/specified/models/skill/items/SkillSelectorRow";

export interface PickedSkill {
  skillId: number;
  level: number;
}

interface SkillsPickerProps {
  label: string;
  description: string;
  skills: Skill[];
  isLoading: boolean;
  search: string;
  onSearchChange: (value: string) => void;
  selected: PickedSkill[];
  onToggle: (skillId: number) => void;
  onLevelChange: (skillId: number, level: number) => void;
}

/**
 * Searchable skill catalog + a list of picked skills, each with a proficiency LevelPicker and
 * remove control. Shared by the create-user and create-project sheets; the caller owns the form
 * state and adapts its own shape to/from `PickedSkill` (skillId + level).
 */
export default function SkillsPicker({
  label,
  description,
  skills,
  isLoading,
  search,
  onSearchChange,
  selected,
  onToggle,
  onLevelChange,
}: SkillsPickerProps) {
  const selectedIds = useMemo(() => new Set(selected.map((s) => s.skillId)), [selected]);

  return (
    <Field>
      <div className="flex items-center justify-between mb-1">
        <FieldLabel>{label}</FieldLabel>
        <span className="text-[11px] text-muted-foreground tabular-nums">{selected.length} added</span>
      </div>
      <SelectorList
        items={skills}
        renderItem={(s) => (
          <SkillSelectorRow
            key={s.id}
            skill={s}
            selected={selectedIds.has(Number(s.id))}
            onToggle={() => onToggle(Number(s.id))}
            searchTerm={search}
          />
        )}
        renderSkeleton={() => <SkillSelectorRow.Skeleton />}
        searchValue={search}
        onSearchChange={onSearchChange}
        searchPlaceholder="Search skills..."
        isLoading={isLoading}
        emptyMessage="No skills found."
        maxHeight="max-h-64"
        selected={
          selected.length > 0 && (
            <div className="space-y-2">
              {selected.map((s) => {
                const skill = skills.find((sk) => Number(sk.id) === s.skillId);
                return (
                  <div
                    key={s.skillId}
                    className="flex items-center gap-2.5 rounded-xl border border-border/60 bg-card px-3 py-2.5"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-foreground truncate leading-tight">
                        {skill?.name ?? `Skill #${s.skillId}`}
                      </p>
                      {skill?.category?.name && (
                        <p className="text-[11px] text-muted-foreground truncate mt-0.5">{skill.category.name}</p>
                      )}
                    </div>
                    <LevelPicker value={s.level} onChange={(lvl) => onLevelChange(s.skillId, lvl)} />
                    <button
                      type="button"
                      onClick={() => onToggle(s.skillId)}
                      className="size-7 grid place-items-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/60 cursor-pointer"
                    >
                      <XIcon className="size-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )
        }
      />
      <FieldDescription>{description}</FieldDescription>
    </Field>
  );
}
