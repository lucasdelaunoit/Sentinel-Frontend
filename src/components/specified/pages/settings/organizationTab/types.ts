import type { ReactNode } from "react";

export type OrgFormFields = Required<UpdateOrganizationSettingsRequest>;

export interface OrgSettingsTabProps {
  form: OrgFormFields;
  setForm: (form: OrgFormFields) => void;
  saveAction?: ReactNode;
}
