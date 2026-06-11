import { useEffect, useMemo, useRef, useState } from "react";
import useGetOrganizationSettings from "@/api/settings/organization/useGetOrganizationSettings";
import useUpdateOrganizationSettings from "@/api/settings/organization/useUpdateOrganizationSettings";
import RulesSettingsTab from "../organizationTab/RulesSettingsTab";
import SectionSaveButton from "../organizationTab/SectionSaveButton";
import type { OrgFormFields } from "../organizationTab/types";

const FIELDS: (keyof OrgFormFields)[] = [
  "silo_threshold",
  "kci_min_level",
  "critical_bus_factor_threshold",
  "absence_horizon_days",
  "rule_violation_penalty",
];

const SAVED_FLASH_MS = 2000;

export default function DefaultRulesContainer() {
  const { data, isLoading } = useGetOrganizationSettings();
  const { updateOrganizationSettings } = useUpdateOrganizationSettings();
  const [form, setForm] = useState<OrgFormFields | null>(null);
  const [original, setOriginal] = useState<OrgFormFields | null>(null);
  const [justSaved, setJustSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (data) {
      setForm(data);
      setOriginal(data);
    }
  }, [data]);

  useEffect(() => {
    return () => {
      if (flashTimer.current) clearTimeout(flashTimer.current);
    };
  }, []);

  const dirty = useMemo(() => {
    if (!form || !original) return false;
    return FIELDS.some((f) => form[f] !== original[f]);
  }, [form, original]);

  if (isLoading || !form) return <RulesSettingsTab.Skeleton />;

  async function save() {
    if (!form || !original) return;
    const payload: Partial<OrgFormFields> = {};
    FIELDS.forEach((f) => {
      if (form[f] !== original[f]) {
        (payload as Record<string, unknown>)[f] = form[f];
      }
    });
    if (Object.keys(payload).length === 0) return;
    setJustSaved(false);
    setSaving(true);
    try {
      await updateOrganizationSettings(payload);
      setOriginal({ ...original, ...payload });
      setJustSaved(true);
      if (flashTimer.current) clearTimeout(flashTimer.current);
      flashTimer.current = setTimeout(() => setJustSaved(false), SAVED_FLASH_MS);
    } catch {
      // toast handled in hook
    } finally {
      setSaving(false);
    }
  }

  return (
    <RulesSettingsTab
      form={form}
      setForm={setForm}
      saveAction={<SectionSaveButton dirty={dirty} isPending={saving} justSaved={justSaved} onSave={save} />}
    />
  );
}
