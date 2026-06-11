import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import ComposedSheet from "@/components/common/sheets/ComposedSheet.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import DataPagination from "@/components/common/pagination/DataPagination.tsx";
import Feedback from "@/components/common/feedbacks/Feedback.tsx";
import { useTablePagination } from "@/hooks/useTablePagination.ts";
import { cn } from "@/lib/utils.ts";
import useGetUsers from "@/api/user/useGetUsers.ts";
import MediumUserRow from "@/components/specified/models/user/items/MediumUserRow.tsx";

type SheetFilter = "all" | UserStatus;

const SHEET_FILTERS: { value: SheetFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "available", label: "Available" },
  { value: "away", label: "Away" },
];

interface AllUsersSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
}

export default function AllUsersSheet({
  open,
  onOpenChange,
  title = "All Employees",
  description,
}: AllUsersSheetProps) {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<SheetFilter>("all");
  const { page, setPage, perPage } = useTablePagination(15, [search, filter]);

  const {
    data: users,
    total,
    lastPage,
    isLoading,
    isError,
  } = useGetUsers({
    page,
    per_page: perPage,
    search: search || undefined,
    filters: filter !== "all" ? [{ field: "status", value: filter }] : undefined,
    includes: ["department"],
  });

  return (
    <ComposedSheet
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description ?? `${total} team member${total === 1 ? "" : "s"}`}
      maxWidth="sm:max-w-[420px]"
      subheader={
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or role…"
              className="pl-9"
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {SHEET_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={cn(
                  "px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors cursor-pointer",
                  filter === f.value
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/70",
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      }
      footer={
        !isLoading && !isError && total > 0 ? (
          <div className="flex justify-center">
            <DataPagination page={page} totalPages={lastPage} onPageChange={setPage} />
          </div>
        ) : null
      }
    >
      {isLoading ? (
        <div className="space-y-4 p-0.5">
          {Array.from({ length: perPage > 8 ? 8 : perPage }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="size-8 rounded-xl shrink-0" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3.5 w-32" />
                <Skeleton className="h-3 w-20" />
              </div>
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <Feedback variant="danger" title="Failed to load employees" description="Check API connection." />
      ) : users.length === 0 ? (
        <Feedback variant="neutral" title="No matches" description="Try adjusting the search or filter." />
      ) : (
        <div className="space-y-2">
          {users.map((user) => (
            <MediumUserRow
              key={user.id}
              className="cursor-pointer"
              user={user}
              onClick={() => {
                navigate(`/users/${user.id}`);
                onOpenChange(false);
              }}
            />
          ))}
        </div>
      )}
    </ComposedSheet>
  );
}
