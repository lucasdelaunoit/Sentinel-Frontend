import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button.tsx";
import { Field, FieldDescription } from "@/components/ui/field.tsx";
import ComposedSheet from "@/components/common/sheets/ComposedSheet.tsx";
import SelectorList from "@/components/common/inputs/SelectorList.tsx";
import UserSelectorRow from "@/components/specified/models/user/items/UserSelectorRow.tsx";
import useGetUsers from "@/api/user/useGetUsers.ts";
import useAttachUserToProject from "@/api/projects/useAttachUserToProject.ts";

interface AddProjectMembersSheetProps {
  projectId: string | undefined;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AddProjectMembersSheet({ projectId, open, onOpenChange }: AddProjectMembersSheetProps) {
  const [search, setSearch] = useState("");
  const [picked, setPicked] = useState<number | null>(null);

  const { data: candidates, isLoading: usersLoading } = useGetUsers({
    per_page: 50,
    search: search || undefined,
    filters: projectId ? [{ field: "not_in_project", value: projectId }] : undefined,
  });
  const { attachUserToProject, isLoading: attaching } = useAttachUserToProject();

  useEffect(() => {
    if (open) {
      setSearch("");
      setPicked(null);
    }
  }, [open]);

  function select(id: number) {
    setPicked((prev) => (prev === id ? null : id));
  }

  function close() {
    setSearch("");
    setPicked(null);
    onOpenChange(false);
  }

  async function submit() {
    if (!projectId || picked === null) return;
    try {
      await attachUserToProject({ projectId, userId: picked });
      toast.success("Member added.");
      close();
    } catch {
      /* hook toasts the error */
    }
  }

  return (
    <ComposedSheet
      open={open}
      onOpenChange={(v) => {
        if (!v) close();
      }}
      title="Add team members"
      description="Assign existing employees to this project"
      maxWidth="sm:max-w-[520px]"
      footer={
        <>
          <Button variant="outline" onClick={close} className="flex-1" disabled={attaching} size="lg">
            Cancel
          </Button>
          <Button onClick={submit} disabled={picked === null} loading={attaching} className="flex-1" size="lg">
            {attaching ? "Adding…" : "Add member"}
          </Button>
        </>
      }
    >
      <Field>
        <SelectorList
          items={candidates}
          renderItem={(u) => (
            <UserSelectorRow
              key={u.id}
              user={u}
              selected={picked === Number(u.id)}
              onToggle={() => select(Number(u.id))}
              searchTerm={search}
            />
          )}
          renderSkeleton={() => <UserSelectorRow.Skeleton />}
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search employees..."
          isLoading={usersLoading}
          emptyMessage="No employees available to add."
          maxHeight="max-h-[60vh]"
        />
        <FieldDescription>Members already on the project are hidden</FieldDescription>
      </Field>
    </ComposedSheet>
  );
}
