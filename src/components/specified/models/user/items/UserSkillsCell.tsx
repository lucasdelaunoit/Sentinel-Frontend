const CHIP_CLASS = "inline-flex items-center rounded-md bg-muted/60 px-1.5 py-0.5 text-[10px] font-medium text-foreground/60";

/** Compact table cell: skill count plus up to three skill chips and a +N overflow chip. */
export default function UserSkillsCell({ skills }: { skills: UserSkillItem[] }) {
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <span className="font-semibold text-foreground text-[14px]">{skills.length}</span>
      <span className="text-muted-foreground text-[11px]">skills</span>
      <div className="flex gap-1 ml-1 flex-wrap">
        {skills.slice(0, 3).map((s) => (
          <span key={s.id} className={CHIP_CLASS}>
            {s.name}
          </span>
        ))}
        {skills.length > 3 && <span className={CHIP_CLASS}>+{skills.length - 3}</span>}
      </div>
    </div>
  );
}
