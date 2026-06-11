import { useMemo, useState } from "react";
import { PlusIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import ComposedCard from "@/components/common/cards/ComposedCard";
import SearchBar from "@/components/common/inputs/SearchBar";
import ComposedSelect from "@/components/common/inputs/ComposedSelect";
import CoverageRadar, { type CoverageRadarDatum } from "@/components/common/charts/CoverageRadar";
import AddUserSkillSheet from "@/components/specified/models/skill/sheets/AddUserSkillSheet";
import useGetSkillsForUser from "@/api/user/useGetSkillsForUser";
import useGetUserCompetencyRadar from "@/api/user/useGetUserCompetencyRadar";
import useGetSkillCategories from "@/api/skillCategory/useGetSkillCategories";
import MediumUserSkillCard from "@/components/specified/models/userSkill/datas/MediumUserSkillCard.tsx";
import Feedback from "@/components/common/feedbacks/Feedback.tsx";
import CountDisplay from "@/components/common/displays/CountDisplay.tsx";

interface UserSkillsTabProps {
  userId: string;
}

export default function UserSkillsTab({ userId }: UserSkillsTabProps) {
  const [addOpen, setAddOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState<number | null>(null);

  const { data: categories = [] } = useGetSkillCategories();

  const filters = useMemo(() => {
    const f: Array<{ field: string; value: string | number }> = [];
    if (categoryId !== null) f.push({ field: "category_id", value: categoryId });
    return f.length ? f : undefined;
  }, [categoryId]);

  const {
    data: skills,
    isLoading,
    total: skillsTotal,
    isError,
  } = useGetSkillsForUser(userId, {
    per_page: 100,
    search: search || undefined,
    filters,
  });

  const { data: radar, isLoading: isLoadingRadar } = useGetUserCompetencyRadar(userId);

  const radarData: CoverageRadarDatum[] = useMemo(
    () => (radar ?? []).map((r) => ({ axis: r.category, value: r.value, target: r.target })),
    [radar],
  );

  const showAddInHeader = isLoading || (!!skills && skills.length > 0);

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <ComposedCard
          title={
            <div className="flex items-center gap-2">
              <span>Skills & Proficiency</span>
              {isLoading ? <CountDisplay.Skeleton /> : <CountDisplay count={skillsTotal} />}
            </div>
          }
          action={
            <div className="flex items-center gap-2">
              <SearchBar value={search} onChange={setSearch} placeholder="Search..." size="sm" className="w-44" />
              <ComposedSelect<number>
                value={categoryId}
                onChange={setCategoryId}
                options={categories.map((c) => ({ value: c.id, label: c.name }))}
                nullLabel="All categories"
              />
              {showAddInHeader && (
                <Button
                  size="sm"
                  onClick={() => setAddOpen(true)}
                  disabled={!userId || isLoading}
                  className="gap-1.5 h-8 px-3 text-[12px] font-medium rounded-md btn-press"
                >
                  <PlusIcon className="size-3.5" weight="bold" />
                  Add a skill
                </Button>
              )}
            </div>
          }
          className="lg:col-span-3"
        >
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <MediumUserSkillCard.Skeleton key={i} />
              ))}
            </div>
          ) : isError ? (
            <p className="text-[13px] text-muted-foreground text-center py-12">Failed to load skills.</p>
          ) : skills.length === 0 ? (
            <Feedback
              variant="warning"
              title={true ? "No skills match your filters." : "No skills recorded for this employee yet."}
              description="Add your first skill to get started."
              className="h-96"
              action={
                <Button onClick={() => setAddOpen(true)} className="sm">
                  <PlusIcon className="size-3.5" />
                  Add your first skill
                </Button>
              }
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {skills.map((skill) => (
                <MediumUserSkillCard key={skill.id} userId={userId} skill={skill} searchTerm={search} />
              ))}
            </div>
          )}
        </ComposedCard>

        <ComposedCard title="Competency Radar" className="lg:col-span-2">
          {isLoadingRadar || !radar ? (
            <CoverageRadar.Skeleton />
          ) : radarData.length === 0 ? (
            <p className="text-[13px] text-muted-foreground text-center py-12">No categories to display</p>
          ) : (
            <CoverageRadar data={radarData} valueLabel="Proficiency" targetLabel="Target" />
          )}
        </ComposedCard>
      </div>

      <AddUserSkillSheet userId={userId} open={addOpen} onOpenChange={setAddOpen} initialCategoryId={categoryId} />
    </>
  );
}
