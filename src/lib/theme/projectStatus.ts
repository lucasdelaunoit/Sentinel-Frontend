export const PROJECT_STATUS_LABEL: Record<ProjectStatus, string> = {
  planned: "Planned",
  active: "Active",
  paused: "Paused",
  completed: "Completed",
  archived: "Archived",
};

/** Solid fill — status badges and project avatars. */
export const PROJECT_STATUS_BG: Record<ProjectStatus, string> = {
  planned: "bg-planned",
  active: "bg-primary",
  paused: "bg-warning",
  completed: "bg-info",
  archived: "bg-muted text-muted-foreground",
};
