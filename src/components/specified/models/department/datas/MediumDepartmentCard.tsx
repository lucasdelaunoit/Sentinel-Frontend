import { useState } from "react";
import { CircleNotchIcon, PencilSimpleIcon, TrashIcon, UsersIcon } from "@phosphor-icons/react";
import SecondaryCard from "@/components/common/cards/SecondaryCard.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import ComposedAlertDialog from "@/components/common/dialogs/ComposedAlertDialog.tsx";
import EditDepartmentSheet from "@/components/specified/models/department/sheets/EditDepartmentSheet.tsx";
import { HighlightMatch } from "@/components/common/displays/HighlightMatch.tsx";
import useDeleteDepartment from "@/api/department/useDeleteDepartment.ts";

interface MediumDepartmentCardProps {
  department: Department;
  searchTerm?: string;
  onDeleted?: () => void;
}

export default function MediumDepartmentCard({ department, searchTerm = "", onDeleted }: MediumDepartmentCardProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const { deleteDepartment, isLoading: isDeleting } = useDeleteDepartment();

  const usersCount = department.users_count ?? 0;
  const hasUsers = usersCount > 0;

  return (
    <>
      <SecondaryCard
        key={department.id}
        title={
          <span className="font-semibold">
            <HighlightMatch text={department.name} searchTerm={searchTerm} />
          </span>
        }
        className="bg-tertiary p-3"
        description={
          <span className="inline-flex items-center gap-1 text-[11px] text-secondary-foreground/60">
            <UsersIcon className="size-3" weight="bold" />
            {`${usersCount} member${usersCount !== 1 ? "s" : ""}`}
          </span>
        }
        action={
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={() => setEditOpen(true)} className="hover:bg-card">
              <PencilSimpleIcon />
            </Button>
            <ComposedAlertDialog
              open={deleteOpen}
              onOpenChange={setDeleteOpen}
              trigger={
                <Button variant="destructive" size="icon" disabled={isDeleting}>
                  {isDeleting ? <CircleNotchIcon className="animate-spin" weight="bold" /> : <TrashIcon />}
                </Button>
              }
              title={`Delete department "${department.name}"?`}
              description={
                hasUsers
                  ? `${usersCount} user${usersCount !== 1 ? "s" : ""} currently in this department will lose their assignment. Any rules scoped to it will become orphaned. This cannot be undone.`
                  : "This will permanently delete the department. Any rules scoped to it will become orphaned."
              }
              confirmLabel="Delete"
              pendingLabel="Deleting…"
              isPending={isDeleting}
              variant="destructive"
              onConfirm={() =>
                deleteDepartment(department.id, {
                  onSuccess: () => {
                    setDeleteOpen(false);
                    onDeleted?.();
                  },
                })
              }
            />
          </div>
        }
      />
      <EditDepartmentSheet open={editOpen} onOpenChange={setEditOpen} department={department} />
    </>
  );
}

MediumDepartmentCard.Skeleton = function MediumDepartmentCardSkeleton() {
  return (
    <div className="rounded-xl bg-tertiary p-3 flex items-center gap-3">
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-32 rounded-md" />
        <Skeleton className="h-3 w-16 rounded-full" />
      </div>
      <div className="flex items-center gap-1.5">
        <Skeleton className="size-8 rounded-md shrink-0" />
        <Skeleton className="size-8 rounded-md shrink-0" />
      </div>
    </div>
  );
};
