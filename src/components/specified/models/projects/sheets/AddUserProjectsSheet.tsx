import { useEffect, useState } from "react";
import { toast } from "sonner";
import { FolderPlusIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription } from "@/components/ui/field";
import ComposedSheet from "@/components/common/sheets/ComposedSheet";
import SelectorList from "@/components/common/inputs/SelectorList";
import ProjectSelectorRow from "@/components/specified/models/projects/items/ProjectSelectorRow";
import useGetProjects from "@/api/projects/useGetProjects";
import useAttachUserToProject from "@/api/projects/useAttachUserToProject";

interface AddUserProjectsSheetProps {
  userId: string | undefined;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AddUserProjectsSheet({ userId, open, onOpenChange }: AddUserProjectsSheetProps) {
  const [search, setSearch] = useState("");
  const [picked, setPicked] = useState<number | null>(null);

  const { data: candidates, isLoading: projectsLoading } = useGetProjects({
    per_page: 50,
    search: search || undefined,
    filters: userId ? [{ field: "not_in_user", value: userId }] : undefined,
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
    if (!userId || picked === null) return;
    try {
      await attachUserToProject({ projectId: picked, userId: Number(userId) });
      toast.success("Project assigned.");
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
      title="Assign to project"
      description="Pick a project to add this employee to"
      icon={<FolderPlusIcon className="size-4 text-primary" />}
      maxWidth="sm:max-w-[520px]"
      footer={
        <>
          <Button variant="outline" onClick={close} className="flex-1" disabled={attaching} size="lg">
            Cancel
          </Button>
          <Button onClick={submit} disabled={picked === null || attaching} className="flex-1" size="lg">
            {attaching ? "Assigning…" : "Assign project"}
          </Button>
        </>
      }
    >
      <Field>
        <SelectorList
          items={candidates}
          renderItem={(p) => (
            <ProjectSelectorRow
              key={p.id}
              project={p}
              selected={picked === Number(p.id)}
              onToggle={() => select(Number(p.id))}
              searchTerm={search}
            />
          )}
          renderSkeleton={() => <ProjectSelectorRow.Skeleton />}
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search projects..."
          isLoading={projectsLoading}
          emptyMessage="No projects available to assign."
          maxHeight="max-h-[60vh]"
        />
        <FieldDescription>Projects this employee is already on are hidden</FieldDescription>
      </Field>
    </ComposedSheet>
  );
}
