import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import DataPagination from "@/components/common/pagination/DataPagination";
import { Plus, Layers, AlertTriangle } from "lucide-react";
import ComposedCard from "@/components/common/cards/ComposedCard";
import ComposedSheet from "@/components/common/sheets/ComposedSheet";
import useGetSkillCategories from "@/hooks/useGetSkillCategories";
import useGetSkills from "@/api/skills/useGetSkills.ts";
import { SecondaryButton } from "@/components/common/buttons/SecondaryButton.tsx";
import SearchBar from "@/components/common/inputs/SearchBar.tsx";
import MediumSkillCard from "@/components/specified/models/skill/datas/MediumSkillCard.tsx";
import SmallSkillCategoryCard from "@/components/specified/models/skill/datas/SmallSkillCategoryCard.tsx";
import Feedback from "@/components/common/feedbacks/Feedback.tsx";

const MAX_CATEGORIES = 8;
const ITEMS_PER_PAGE = 12;

export default function SkillsTab() {
  const [categories, setCategories] = useState<SkillCategory[]>([]);
  const [selectedCatId, setSelectedCatId] = useState<number | "ALL">("ALL");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [skillSheetOpen, setSkillSheetOpen] = useState(false);
  const [catSheetOpen, setCatSheetOpen] = useState(false);
  const [newSkillName, setNewSkillName] = useState("");
  const [newSkillCatId, setNewSkillCatId] = useState<number | "">("");
  const [newCatName, setNewCatName] = useState("");

  const { data: categoriesData, isLoading: catLoading } = useGetSkillCategories();
  const { data: skillsData, isLoading: skillsLoading } = useGetSkills({
    page,
    per_page: ITEMS_PER_PAGE,
    search: search || undefined,
    filters: selectedCatId !== "ALL" ? [{ field: "category_id", value: selectedCatId }] : undefined,
  });

  const list: Skill[] = skillsData?.data ?? [];
  const totalPages = skillsData?.last_page ?? 1;

  useEffect(() => {
    if (categoriesData) {
      setCategories(categoriesData);
      setNewSkillCatId((prev) => prev || categoriesData[0]?.id || "");
    }
  }, [categoriesData]);

  useEffect(() => {
    setPage(1);
  }, [search, selectedCatId]);

  function handleAddSkill() {
    if (!newSkillName.trim()) return;
    // TODO: POST /api/skills
    setNewSkillName("");
    setSkillSheetOpen(false);
  }

  function addCategory() {
    const name = newCatName.trim().toUpperCase();
    if (!name || categories.some((c) => c.name === name) || categories.length >= MAX_CATEGORIES) return;
    // TODO: POST /api/skill-categories
    setNewCatName("");
    setCatSheetOpen(false);
  }

  const hasFilter = !!search;

  const fieldCls =
    "w-full rounded-xl border border-border/60 bg-background px-4 py-2.5 text-[13px] text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all";

  return (
    <>
      <div className="flex gap-4 items-start">
        {/* Left — Categories */}
        <ComposedCard
          title="Categories"
          className="w-60 shrink-0"
          action={
            <div className="ml-auto flex items-center gap-2">
              <span className="text-[11px] font-medium text-muted-foreground/50 tabular-nums">
                {categories.length}/{MAX_CATEGORIES}
              </span>
            </div>
          }
        >
          <div className="flex flex-col" style={{ minHeight: "440px" }}>
            <button
              onClick={() => setSelectedCatId("ALL")}
              className={cn(
                "flex items-center justify-between rounded-lg px-2.5 py-2 text-[13px] font-semibold mb-1 transition-colors",
                selectedCatId === "ALL"
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
              )}
            >
              All skills
            </button>

            <div className="flex-1 overflow-y-auto space-y-0.5">
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

            {categories.length >= MAX_CATEGORIES && (
              <div className="border-t border-border/40 pt-3 mt-3 flex items-center gap-1.5 text-[10px] text-amber-600">
                <AlertTriangle className="size-3 shrink-0" />
                Max 8 — radar chart limit
              </div>
            )}
          </div>
          <SecondaryButton onClick={() => setCatSheetOpen(true)} disabled={categories.length >= MAX_CATEGORIES}>
            <Plus className="size-3 mb-0.5" />
            Add new category
          </SecondaryButton>
        </ComposedCard>

        {/* Right — Skills grid */}
        <ComposedCard
          title={selectedCatId === "ALL" ? "All skills" : (categories.find((c) => c.id === selectedCatId)?.name ?? "")}
          className="flex-1"
          action={
            <div className="flex items-center gap-2">
              <SearchBar value={search} onChange={setSearch} />
              <Button size="lg" onClick={() => setSkillSheetOpen(true)}>
                <Plus className="size-4" />
                Add Skill
              </Button>
            </div>
          }
        >
          <div className="space-y-4">
            {skillsLoading ? (
              <div className="grid grid-cols-2 gap-3">
                {Array.from({ length: 8 }).map((_, i) => (
                  <MediumSkillCard.Skeleton key={i} />
                ))}
              </div>
            ) : list.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 gap-2">
                <Feedback
                  variant={hasFilter ? "warning" : "neutral"}
                  title={hasFilter ? "No matching skills" : "No skills yet"}
                  description={
                    hasFilter ? "Try a different search term or category." : "Add your first skill to get started."
                  }
                />
                {hasFilter && (
                  <button onClick={() => setSearch("")} className="text-[12px] text-primary hover:underline">
                    Clear filters
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {list.map((skill) => (
                  <MediumSkillCard key={skill.id} skill={skill} searchTerm={search} />
                ))}
              </div>
            )}

            <div className="pt-3 border-t border-border/40">
              <DataPagination page={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          </div>
        </ComposedCard>
      </div>

      {/* Skill creation sheet */}
      <ComposedSheet
        open={skillSheetOpen}
        onOpenChange={setSkillSheetOpen}
        title="Add Skill"
        description="Define a new skill for the organizational catalog"
        footer={
          <>
            <Button variant="outline" onClick={() => setSkillSheetOpen(false)} className="flex-1 rounded-xl">
              Cancel
            </Button>
            <Button
              onClick={handleAddSkill}
              disabled={!newSkillName.trim()}
              className="flex-1 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Add Skill
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-muted-foreground/70 uppercase tracking-wide">
              Skill Name
            </label>
            <input
              type="text"
              placeholder="e.g. React, AWS, PostgreSQL"
              value={newSkillName}
              onChange={(e) => setNewSkillName(e.target.value)}
              autoFocus
              className={fieldCls}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-muted-foreground/70 uppercase tracking-wide">Category</label>
            <select
              value={newSkillCatId}
              onChange={(e) => setNewSkillCatId(Number(e.target.value))}
              className={cn(fieldCls, "cursor-pointer")}
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </ComposedSheet>

      {/* Category creation sheet */}
      <ComposedSheet
        open={catSheetOpen}
        onOpenChange={setCatSheetOpen}
        title="Add Category"
        description="Categories group skills and define radar chart axes"
        icon={<Layers className="size-4 text-primary" />}
        footer={
          <>
            <Button variant="outline" onClick={() => setCatSheetOpen(false)} className="flex-1 rounded-xl">
              Cancel
            </Button>
            <Button
              onClick={addCategory}
              disabled={!newCatName.trim() || categories.some((c) => c.name === newCatName.trim().toUpperCase())}
              className="flex-1 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Add Category
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-muted-foreground/70 uppercase tracking-wide">
              Category Name
            </label>
            <input
              type="text"
              placeholder="e.g. MOBILE, DATA SCIENCE"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === "Enter" && addCategory()}
              autoFocus
              className={fieldCls}
            />
            <p className="text-[11px] text-muted-foreground">Will appear as a radar chart axis</p>
          </div>
          <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 flex items-start gap-2.5">
            <AlertTriangle className="size-3.5 text-amber-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-[12px] font-semibold text-amber-700">
                {categories.length}/{MAX_CATEGORIES} categories used
              </p>
              <p className="text-[11px] text-amber-600 mt-0.5">
                Radar charts become unreadable beyond 8 axes. This is the enforced maximum.
              </p>
            </div>
          </div>
          <div className="space-y-1.5">
            <p className="text-[11px] font-medium text-muted-foreground/70 uppercase tracking-wide">
              Existing categories
            </p>
            <div className="flex flex-wrap gap-1.5">
              {categories.map((cat) => (
                <span
                  key={cat.id}
                  className="text-[11px] font-semibold bg-muted/50 text-muted-foreground rounded-full px-2.5 py-1"
                >
                  {cat.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </ComposedSheet>
    </>
  );
}
