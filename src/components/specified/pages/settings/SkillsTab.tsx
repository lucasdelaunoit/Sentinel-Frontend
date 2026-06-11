import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import DataPagination from "@/components/common/pagination/DataPagination";
import ComposedCard from "@/components/common/cards/ComposedCard";
import useGetSkillCategories from "@/hooks/useGetSkillCategories";
import useGetSkills from "@/api/skill/useGetSkills.ts";
import { SecondaryButton } from "@/components/common/buttons/SecondaryButton.tsx";
import SearchBar from "@/components/common/inputs/SearchBar.tsx";
import MediumSkillCard from "@/components/specified/models/skill/datas/MediumSkillCard.tsx";
import SmallSkillCategoryCard from "@/components/specified/models/skill/datas/SmallSkillCategoryCard.tsx";
import Feedback from "@/components/common/feedbacks/Feedback.tsx";
import CreateSkillCategorySheet from "@/components/specified/models/skillCategory/sheets/CreateSkillCategorySheet.tsx";
import CreateSkillSheet from "@/components/specified/models/skill/sheets/CreateSkillSheet.tsx";
import { PlusIcon } from "@phosphor-icons/react";

const MAX_CATEGORIES = 8;
const ITEMS_PER_PAGE = 12;

export default function SkillsTab() {
  const [selectedCatId, setSelectedCatId] = useState<number | "ALL">("ALL");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [skillSheetOpen, setSkillSheetOpen] = useState(false);
  const [catSheetOpen, setCatSheetOpen] = useState(false);

  const { data: categoriesData, isLoading: catLoading } = useGetSkillCategories();
  const {
    data: list,
    lastPage: totalPages,
    isLoading: skillsLoading,
  } = useGetSkills({
    page,
    per_page: ITEMS_PER_PAGE,
    search: search || undefined,
    filters: selectedCatId !== "ALL" ? [{ field: "category_id", value: selectedCatId }] : undefined,
  });

  const categories: SkillCategory[] = categoriesData ?? [];

  useEffect(() => {
    setPage(1);
  }, [search, selectedCatId]);

  const selectedCategory = selectedCatId !== "ALL" ? categories.find((c) => c.id === selectedCatId) : undefined;
  const scopeSkillCount = selectedCategory
    ? selectedCategory.skills_count
    : categories.reduce((sum, c) => sum + c.skills_count, 0);
  const isScopeEmpty = !catLoading && scopeSkillCount === 0;

  return (
    <>
      <div className="flex gap-4 items-start">
        {/* Left — Categories */}
        <ComposedCard
          title="Categories"
          className="w-64 shrink-0"
          action={
            <div className="ml-auto flex items-center gap-2">
              <span
                className={cn(
                  "text-xs font-medium text-muted-foreground/50 tabular-nums",
                  categories.length === MAX_CATEGORIES && "text-destructive-foreground",
                )}
              >
                {categories.length}/{MAX_CATEGORIES}
              </span>
            </div>
          }
        >
          <div className="flex flex-col mb-2" style={{ minHeight: "440px" }}>
            <button
              onClick={() => setSelectedCatId("ALL")}
              className={cn(
                "flex items-center justify-between rounded-lg px-2.5 py-2 text-[13px] cursor-pointer font-semibold mb-1 transition-colors bg-tertiary",
                selectedCatId === "ALL" ? "bg-primary/10 text-primary" : "hover:text-foreground",
              )}
            >
              All skills
            </button>

            <div className="flex-1 overflow-y-auto space-y-1">
              {catLoading
                ? Array.from({ length: 5 }).map((_, i) => <SmallSkillCategoryCard.Skeleton key={i} />)
                : categories.map((cat) => (
                    <SmallSkillCategoryCard
                      key={cat.id}
                      category={cat}
                      isActive={selectedCatId === cat.id}
                      onSelect={() => setSelectedCatId(cat.id)}
                      onDeleted={() => {
                        if (selectedCatId === cat.id) setSelectedCatId("ALL");
                      }}
                    />
                  ))}
            </div>
          </div>
          <SecondaryButton onClick={() => setCatSheetOpen(true)} disabled={categories.length >= MAX_CATEGORIES}>
            <PlusIcon className="size-3 mb-0.5" weight="bold" />
            Add new category
          </SecondaryButton>
        </ComposedCard>

        {/* Right — Skills grid */}
        <ComposedCard
          title={selectedCategory?.name ?? "All skills"}
          className="flex-1 h-auto"
          action={
            isScopeEmpty ? null : (
              <div className="flex items-center gap-2">
                <SearchBar value={search} onChange={setSearch} size="sm" />
                <Button onClick={() => setSkillSheetOpen(true)}>
                  <PlusIcon className="size-3.5" weight="bold" />
                  Add Skill
                </Button>
              </div>
            )
          }
        >
          <div className="space-y-4">
            {skillsLoading ? (
              <div className="grid grid-cols-2 gap-3">
                {Array.from({ length: 8 }).map((_, i) => (
                  <MediumSkillCard.Skeleton key={i} />
                ))}
              </div>
            ) : isScopeEmpty ? (
              <Feedback
                variant="warning"
                title={selectedCategory ? `No skills in ${selectedCategory.name}` : "No skills yet"}
                description="Add your first skill to get started."
                className="h-96"
                action={
                  <Button onClick={() => setSkillSheetOpen(true)} className="sm">
                    <PlusIcon className="size-3.5" />
                    Add your first skill
                  </Button>
                }
              />
            ) : list.length === 0 ? (
              <Feedback
                variant="warning"
                title="No matching skills"
                description="Try a different search term or category."
                className="h-96"
                action={
                  <Button variant="link" onClick={() => setSearch("")}>
                    Clear filters
                  </Button>
                }
              />
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {list.map((skill) => (
                  <MediumSkillCard key={skill.id} skill={skill} searchTerm={search} />
                ))}
              </div>
            )}

            {!isScopeEmpty && <DataPagination page={page} totalPages={totalPages} onPageChange={setPage} />}
          </div>
        </ComposedCard>
      </div>

      <CreateSkillSheet
        open={skillSheetOpen}
        onOpenChange={setSkillSheetOpen}
        categories={categories}
        presetCategory={selectedCategory}
      />

      <CreateSkillCategorySheet
        open={catSheetOpen}
        onOpenChange={setCatSheetOpen}
        categories={categories}
        maxCategories={MAX_CATEGORIES}
      />
    </>
  );
}
