import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Plus, X, Layers, AlertTriangle } from "lucide-react";
import ComposedCard from "@/components/common/cards/ComposedCard";
import ComposedSheet from "@/components/common/sheets/ComposedSheet";
import useGetSkillCategories from "@/hooks/useGetSkillCategories";
import useGetSkills from "@/api/skills/useGetSkills.ts";
import { Skeleton } from "@/components/ui/skeleton";
import { SecondaryButton } from "@/components/common/buttons/SecondaryButton.tsx";
import SearchBar from "@/components/common/inputs/SearchBar.tsx";
import MediumSkillCard from "@/components/specified/models/skill/datas/MediumSkillCard.tsx";

export default function SkillsTab() {
  const MAX_CATEGORIES = 8;
  const ITEMS_PER_PAGE = 12;

  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCat, setSelectedCat] = useState<string>("ALL");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [skillSheetOpen, setSkillSheetOpen] = useState(false);
  const [catSheetOpen, setCatSheetOpen] = useState(false);
  const [newSkillName, setNewSkillName] = useState("");
  const [newSkillCat, setNewSkillCat] = useState("");
  const [newCatName, setNewCatName] = useState("");

  const { data: categoriesData, isLoading: catLoading } = useGetSkillCategories();
  const { data: skillsData, isLoading: skillsLoading } = useGetSkills({
    page,
    per_page: ITEMS_PER_PAGE,
    search: search || undefined,
    filters: selectedCat !== "ALL" ? [{ field: "category", value: selectedCat }] : undefined,
  });

  const list: Skill[] = skillsData?.data ?? [];
  const totalPages = skillsData?.last_page ?? 1;

  useEffect(() => {
    if (categoriesData) {
      setCategories(categoriesData.map((c) => c.name));
      setNewSkillCat((prev) => prev || categoriesData[0]?.name || "");
    }
  }, [categoriesData]);

  useEffect(() => {
    setPage(1);
  }, [search, selectedCat]);

  function handleAddSkill() {
    if (!newSkillName.trim()) return;
    // TODO: POST /api/skills
    setNewSkillName("");
    setSkillSheetOpen(false);
  }

  function addCategory() {
    const name = newCatName.trim().toUpperCase();
    if (!name || categories.includes(name) || categories.length >= MAX_CATEGORIES) return;
    setCategories([...categories, name]);
    setNewCatName("");
    setCatSheetOpen(false);
  }

  function deleteCategory(cat: string) {
    const hasSkills = list.some((s) => s.category.name === cat);
    if (hasSkills) return;
    setCategories(categories.filter((c) => c !== cat));
    if (selectedCat === cat) setSelectedCat("ALL");
  }

  const hasFilter = !!search;
  const totalCount = skillsData?.total ?? 0;

  const fieldCls =
    "w-full rounded-xl border border-border/60 bg-background px-4 py-2.5 text-[13px] text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all";

  return (
    <>
      <div className="flex gap-4 items-start">
        {/* Left — Categories */}
        <ComposedCard
          title="Categories"
          className="w-52 shrink-0"
          action={
            <div className="ml-auto flex items-center gap-2">
              <span className="text-[11px] font-medium text-muted-foreground/50 tabular-nums">
                {categories.length}/{MAX_CATEGORIES}
              </span>
            </div>
          }
        >
          <div className="flex flex-col mt-3" style={{ minHeight: "440px" }}>
            <button
              onClick={() => setSelectedCat("ALL")}
              className={cn(
                "flex items-center justify-between rounded-lg px-2.5 py-2 text-[12px] font-semibold mb-1 transition-colors",
                selectedCat === "ALL"
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
              )}
            >
              All skills
              <span
                className={cn(
                  "text-[11px] font-bold tabular-nums",
                  selectedCat === "ALL" ? "text-primary" : "text-muted-foreground/50",
                )}
              >
                {selectedCat === "ALL" ? totalCount : ""}
              </span>
            </button>

            <div className="flex-1 overflow-y-auto space-y-0.5">
              {catLoading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-2 px-2.5 py-2">
                      <div className="flex-1 space-y-1">
                        <Skeleton className="h-3 w-20 rounded" />
                        <Skeleton className="h-2 w-12 rounded" />
                      </div>
                      <Skeleton className="h-3 w-4 rounded" />
                    </div>
                  ))
                : categories.map((cat) => {
                    const isActive = selectedCat === cat;
                    const count = isActive ? totalCount : null;
                    return (
                      <div
                        key={cat}
                        onClick={() => setSelectedCat(cat)}
                        className={cn(
                          "group flex items-center gap-2 rounded-lg px-2.5 py-2 cursor-pointer transition-colors",
                          isActive ? "bg-primary/10" : "hover:bg-muted/50",
                        )}
                      >
                        <div className="flex-1 min-w-0">
                          <p
                            className={cn(
                              "text-[12px] font-semibold truncate",
                              isActive ? "text-primary" : "text-foreground",
                            )}
                          >
                            {cat}
                          </p>
                          <p className="text-[10px] text-muted-foreground/50">
                            {count} skill{count !== 1 ? "s" : ""}
                          </p>
                        </div>
                        {count === 0 ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteCategory(cat);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1 rounded hover:text-rose-500 hover:bg-rose-50 transition-all text-muted-foreground/40 shrink-0"
                          >
                            <X className="size-3" />
                          </button>
                        ) : (
                          <span
                            className={cn(
                              "text-[10px] font-bold tabular-nums shrink-0",
                              isActive ? "text-primary" : "text-muted-foreground/40",
                            )}
                          >
                            {count}
                          </span>
                        )}
                      </div>
                    );
                  })}
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
          title={selectedCat === "ALL" ? "All skills" : selectedCat}
          className="flex-1"
          action={
            <div className="flex items-center gap-2">
              <SearchBar value={search} onChange={setSearch} />
              <Button
                onClick={() => setSkillSheetOpen(true)}
                className="gap-1.5 h-9 px-3 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl text-[13px] font-medium shadow-sm shadow-primary/10 shrink-0"
              >
                <Plus className="size-4" />
                Add Skill
              </Button>
            </div>
          }
        >
          <div className="mt-4 space-y-4">
            {hasFilter && (
              <div className="flex items-center gap-2">
                <span className="text-[12px] text-muted-foreground">
                  {totalCount} skill{totalCount !== 1 ? "s" : ""}
                </span>
                <button onClick={() => setSearch("")} className="text-[11px] text-primary hover:underline">
                  Clear filters
                </button>
              </div>
            )}

            {skillsLoading ? (
              <div className="grid grid-cols-2 gap-3">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-border/60 bg-background p-3.5 flex items-center gap-3"
                  >
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-3.5 w-24 rounded" />
                      <Skeleton className="h-2.5 w-16 rounded-full" />
                    </div>
                    <Skeleton className="size-7 rounded-lg shrink-0" />
                  </div>
                ))}
              </div>
            ) : list.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-muted-foreground gap-2">
                <p className="text-[13px] font-medium">No skills</p>
                {hasFilter && (
                  <button onClick={() => setSearch("")} className="text-[12px] text-primary hover:underline">
                    Clear filters
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {list.map((skill) => (
                  <MediumSkillCard key={skill.id} skill={skill} />
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-3 border-t border-border/40">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="text-[12px] font-medium text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors px-2 py-1 rounded-lg hover:bg-muted/50"
                >
                  Previous
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={cn(
                        "size-7 rounded-lg text-[12px] font-medium transition-colors",
                        p === page
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                      )}
                    >
                      {p}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="text-[12px] font-medium text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors px-2 py-1 rounded-lg hover:bg-muted/50"
                >
                  Next
                </button>
              </div>
            )}
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
              value={newSkillCat}
              onChange={(e) => setNewSkillCat(e.target.value)}
              className={cn(fieldCls, "cursor-pointer")}
            >
              {categories.map((c) => (
                <option key={c}>{c}</option>
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
              disabled={!newCatName.trim() || categories.includes(newCatName.trim().toUpperCase())}
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
                  key={cat}
                  className="text-[11px] font-semibold bg-muted/50 text-muted-foreground rounded-full px-2.5 py-1"
                >
                  {cat}
                </span>
              ))}
            </div>
          </div>
        </div>
      </ComposedSheet>
    </>
  );
}
