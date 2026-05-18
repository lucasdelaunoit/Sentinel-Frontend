export type OrgFormFields = Required<UpdateOrganizationSettingsRequest>;

export interface OrgSettingsTabProps {
  form: OrgFormFields;
  setForm: (form: OrgFormFields) => void;
}
