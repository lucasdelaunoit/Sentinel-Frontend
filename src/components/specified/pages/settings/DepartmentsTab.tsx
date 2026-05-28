import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import DataPagination from "@/components/common/pagination/DataPagination";
import ComposedCard from "@/components/common/cards/ComposedCard";
import useGetDepartments from "@/api/departments/useGetDepartments";
import SearchBar from "@/components/common/inputs/SearchBar.tsx";
import MediumDepartmentCard from "@/components/specified/models/department/datas/MediumDepartmentCard.tsx";
import Feedback from "@/components/common/feedbacks/Feedback.tsx";
import CreateDepartmentSheet from "@/components/specified/models/department/sheets/CreateDepartmentSheet.tsx";
import { PlusIcon } from "@phosphor-icons/react";

const ITEMS_PER_PAGE = 12;

export default function DepartmentsTab() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [createSheetOpen, setCreateSheetOpen] = useState(false);

  const {
    data: list,
    total,
    lastPage: totalPages,
    isLoading,
  } = useGetDepartments({
    page,
    per_page: ITEMS_PER_PAGE,
    search: search || undefined,
  });

  useEffect(() => {
    setPage(1);
  }, [search]);

  const hasSearch = search.trim().length > 0;
  const isEmpty = !isLoading && total === 0 && !hasSearch;

  return (
    <>
      <ComposedCard
        title="Departments"
        className="h-auto"
        action={
          isEmpty ? null : (
            <div className="flex items-center gap-2">
              <SearchBar value={search} onChange={setSearch} size="sm" />
              <Button onClick={() => setCreateSheetOpen(true)}>
                <PlusIcon className="size-3.5" weight="bold" />
                Add Department
              </Button>
            </div>
          )
        }
      >
        <div className="space-y-4">
          {isLoading ? (
            <div className="grid grid-cols-2 gap-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <MediumDepartmentCard.Skeleton key={i} />
              ))}
            </div>
          ) : isEmpty ? (
            <Feedback
              variant="warning"
              title="No departments yet"
              description="Create your first department to group employees."
              className="h-96"
              action={
                <Button onClick={() => setCreateSheetOpen(true)} className="sm">
                  <PlusIcon className="size-3.5" />
                  Add your first department
                </Button>
              }
            />
          ) : list.length === 0 ? (
            <Feedback
              variant="warning"
              title="No matching departments"
              description="Try a different search term."
              className="h-96"
              action={
                <Button variant="link" onClick={() => setSearch("")}>
                  Clear filters
                </Button>
              }
            />
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {list.map((department) => (
                <MediumDepartmentCard key={department.id} department={department} searchTerm={search} />
              ))}
            </div>
          )}

          {!isEmpty && <DataPagination page={page} totalPages={totalPages} onPageChange={setPage} />}
        </div>
      </ComposedCard>

      <CreateDepartmentSheet open={createSheetOpen} onOpenChange={setCreateSheetOpen} />
    </>
  );
}
