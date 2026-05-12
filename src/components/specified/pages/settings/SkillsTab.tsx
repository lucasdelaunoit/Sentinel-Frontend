import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { BookOpen, Plus, Trash2, X, Layers, AlertTriangle, Search } from "lucide-react";
import ComposedCard from "@/components/common/cards/ComposedCard";
import ComposedSheet from "@/components/common/sheets/ComposedSheet";
import useGetSkillCategories from "@/hooks/useGetSkillCategories";
import { Skeleton } from "@/components/ui/skeleton";
import { SecondaryButton } from "@/components/common/buttons/SecondaryButton.tsx";
import SearchBar from "@/components/common/inputs/SearchBar.tsx";

interface SkillDefinition {
  id: string;
  name: string;
  category: string;
  description: string;
  criticality: "low" | "medium" | "high" | "critical";
  minRedundancy: number;
}

const SKILL_CRITICALITY_STYLES = {
  low: { dot: "bg-slate-400", pill: "bg-slate-100 text-slate-600 border border-slate-200" },
  medium: { dot: "bg-blue-400", pill: "bg-blue-50 text-blue-700 border border-blue-200" },
  high: { dot: "bg-amber-400", pill: "bg-amber-50 text-amber-700 border border-amber-200" },
  critical: { dot: "bg-rose-500", pill: "bg-rose-50 text-rose-700 border border-rose-200" },
};

export default function SkillsTab({
  skills: initialSkills,
  onSave,
}: {
  skills: SkillDefinition[];
  onSave: (s: SkillDefinition[]) => void;
}) {
  const MAX_CATEGORIES = 8;
  const ITEMS_PER_PAGE = 12;

  const { data: categoriesData, isLoading: catLoading } = useGetSkillCategories();

  const [list, setList] = useState(initialSkills);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCat, setSelectedCat] = useState<string>("ALL");
  const [search, setSearch] = useState("");
  const [critFilter, setCritFilter] = useState<SkillDefinition["criticality"] | "all">("all");
  const [page, setPage] = useState(1);

  const [skillSheetOpen, setSkillSheetOpen] = useState(false);
  const [catSheetOpen, setCatSheetOpen] = useState(false);
  const [newSkill, setNewSkill] = useState<Partial<SkillDefinition>>({
    name: "",
    category: "",
    description: "",
    criticality: "medium",
    minRedundancy: 2,
  });
  const [newCatName, setNewCatName] = useState("");

  useEffect(() => {
    if (categoriesData) {
      setCategories(categoriesData.map((c) => c.name));
      setNewSkill((prev) => ({ ...prev, category: prev.category || categoriesData[0]?.name || "" }));
    }
  }, [categoriesData]);

  useEffect(() => {
    setPage(1);
  }, [search, critFilter, selectedCat]);

  function handleDelete(id: string) {
    const updated = list.filter((s) => s.id !== id);
    setList(updated);
    onSave(updated);
  }

  function handleAddSkill() {
    if (!newSkill.name?.trim()) return;
    const skill: SkillDefinition = {
      id: `s${Date.now()}`,
      name: newSkill.name.trim(),
      category: newSkill.category ?? categories[0],
      description: newSkill.description || "",
      criticality: (newSkill.criticality ?? "medium") as SkillDefinition["criticality"],
      minRedundancy: newSkill.minRedundancy ?? 2,
    };
    const updated = [...list, skill];
    setList(updated);
    onSave(updated);
    setNewSkill({ name: "", category: categories[0], description: "", criticality: "medium", minRedundancy: 2 });
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
    if (list.some((s) => s.category === cat)) return;
    setCategories(categories.filter((c) => c !== cat));
    if (selectedCat === cat) setSelectedCat("ALL");
  }

  const filtered = list.filter((s) => {
    const matchCat = selectedCat === "ALL" || s.category === selectedCat;
    const matchSearch =
      !search ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.description.toLowerCase().includes(search.toLowerCase());
    const matchCrit = critFilter === "all" || s.criticality === critFilter;
    return matchCat && matchSearch && matchCrit;
  });

  const hasFilter = !!search || critFilter !== "all";
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
  const catSkillCount = selectedCat === "ALL" ? list.length : list.filter((s) => s.category === selectedCat).length;

  const fieldCls =
    "w-full rounded-xl border border-border/60 bg-background px-4 py-2.5 text-[13px] text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all";

  return (
    <>
      {/* Two ComposedCards side by side */}
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
                {list.length}
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
                    const count = list.filter((s) => s.category === cat).length;
                    const isActive = selectedCat === cat;
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
              <select
                value={critFilter}
                onChange={(e) => setCritFilter(e.target.value as typeof critFilter)}
                className="h-9 rounded-xl border border-border/60 bg-background px-3 text-[13px] text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all cursor-pointer w-40"
              >
                <option value="all">All criticality</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
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
            {/* Filter info */}
            {hasFilter && (
              <div className="flex items-center gap-2">
                <span className="text-[12px] text-muted-foreground">
                  {filtered.length} of {catSkillCount} skill{catSkillCount !== 1 ? "s" : ""}
                </span>
                <button
                  onClick={() => {
                    setSearch("");
                    setCritFilter("all");
                  }}
                  className="text-[11px] text-primary hover:underline"
                >
                  Clear filters
                </button>
              </div>
            )}

            {/* Grid */}
            {paginated.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-muted-foreground gap-2">
                <p className="text-[13px] font-medium">No skills</p>
                {hasFilter && (
                  <button
                    onClick={() => {
                      setSearch("");
                      setCritFilter("all");
                    }}
                    className="text-[12px] text-primary hover:underline"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {paginated.map((skill) => {
                  const crit = SKILL_CRITICALITY_STYLES[skill.criticality];
                  return (
                    <div
                      key={skill.id}
                      className="group rounded-xl border border-border/60 bg-background p-3.5 flex items-start gap-2.5 hover:shadow-sm hover:border-border transition-all"
                    >
                      <div className={cn("size-2 rounded-full mt-1.5 shrink-0", crit.dot)} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-1">
                          <p className="text-[13px] font-semibold text-foreground leading-tight truncate">
                            {skill.name}
                          </p>
                          <Button
                            onClick={() => handleDelete(skill.id)}
                            size="sm"
                            variant="ghost"
                            className="opacity-0 group-hover:opacity-100 h-5 w-5 p-0 -mt-0.5 -mr-0.5 shrink-0 text-muted-foreground/40 hover:text-rose-500 hover:bg-rose-50/50 rounded transition-all"
                          >
                            <Trash2 className="size-3" />
                          </Button>
                        </div>
                        {skill.description && (
                          <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{skill.description}</p>
                        )}
                        <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                          <span
                            className={cn(
                              "inline-flex items-center rounded-full px-1.5 py-0.5 text-[9px] font-semibold",
                              crit.pill,
                            )}
                          >
                            {skill.criticality}
                          </span>
                          {selectedCat === "ALL" && (
                            <span className="text-[9px] font-semibold text-muted-foreground/50 bg-muted/50 rounded px-1.5 py-0.5 uppercase tracking-wide">
                              {skill.category}
                            </span>
                          )}
                          <span className="text-[9px] text-muted-foreground/40 ml-auto">
                            Min ×{skill.minRedundancy}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination */}
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
        icon={<BookOpen className="size-4 text-primary" />}
        footer={
          <>
            <Button variant="outline" onClick={() => setSkillSheetOpen(false)} className="flex-1 rounded-xl">
              Cancel
            </Button>
            <Button
              onClick={handleAddSkill}
              disabled={!newSkill.name?.trim()}
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
              value={newSkill.name}
              onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
              autoFocus
              className={fieldCls}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-muted-foreground/70 uppercase tracking-wide">Category</label>
            <select
              value={newSkill.category}
              onChange={(e) => setNewSkill({ ...newSkill, category: e.target.value })}
              className={cn(fieldCls, "cursor-pointer")}
            >
              {categories.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-muted-foreground/70 uppercase tracking-wide">
              Criticality
            </label>
            <select
              value={newSkill.criticality}
              onChange={(e) =>
                setNewSkill({ ...newSkill, criticality: e.target.value as SkillDefinition["criticality"] })
              }
              className={cn(fieldCls, "cursor-pointer")}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-muted-foreground/70 uppercase tracking-wide">
              Min Redundancy
            </label>
            <input
              type="number"
              min={1}
              max={10}
              value={newSkill.minRedundancy}
              onChange={(e) => setNewSkill({ ...newSkill, minRedundancy: parseInt(e.target.value) || 1 })}
              className={fieldCls}
            />
            <p className="text-[11px] text-muted-foreground">Minimum number of people who must hold this skill</p>
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-muted-foreground/70 uppercase tracking-wide">
              Description <span className="normal-case text-muted-foreground/50">(optional)</span>
            </label>
            <input
              type="text"
              placeholder="Short description"
              value={newSkill.description}
              onChange={(e) => setNewSkill({ ...newSkill, description: e.target.value })}
              className={fieldCls}
            />
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
