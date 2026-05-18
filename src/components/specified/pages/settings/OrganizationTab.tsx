import { useEffect, useMemo, useRef, useState } from "react";
import useGetOrganizationSettings from "@/api/organization/useGetOrganizationSettings";
import useUpdateOrganizationSettings from "@/api/organization/useUpdateOrganizationSettings";
import OrganizationIdentitySettingsTab from "./organizationTab/OrganizationIdentitySettingsTab";
import RiskWeightsSettingsTab from "./organizationTab/RiskWeightsSettingsTab";
import HealthWeightSettingsTab from "./organizationTab/HealthWeightSettingsTab";
import SectionSaveButton from "./organizationTab/SectionSaveButton";
import ScenarioPreviewCard from "./organizationTab/scenarioCard/ScenarioPreviewCard.tsx";
import type { OrgFormFields } from "./organizationTab/types";

type SectionKey = "identity" | "riskWeights" | "health";

const SECTION_FIELDS: Record<SectionKey, (keyof OrgFormFields)[]> = {
  identity: ["name", "fragility_tolerance"],
  riskWeights: [
    "fragility_weight_bus_factor",
    "fragility_weight_uncovered_skills",
    "fragility_weight_silos",
    "fragility_weight_absence_impact",
  ],
  health: ["trajectory_fragility_weight"],
};

const SAVED_FLASH_MS = 2000;

export default function OrganizationTab({ previewVisible = false }: { previewVisible?: boolean }) {
  const { data, isLoading } = useGetOrganizationSettings();
  const { updateOrganizationSettings } = useUpdateOrganizationSettings();
  const [form, setForm] = useState<OrgFormFields | null>(null);
  const [original, setOriginal] = useState<OrgFormFields | null>(null);
  const [justSavedSection, setJustSavedSection] = useState<SectionKey | null>(null);
  const [savingSection, setSavingSection] = useState<SectionKey | null>(null);
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

  const dirtyBySection = useMemo(() => {
    const out: Record<SectionKey, boolean> = { identity: false, riskWeights: false, health: false };
    if (!form || !original) return out;
    (Object.keys(SECTION_FIELDS) as SectionKey[]).forEach((key) => {
      out[key] = SECTION_FIELDS[key].some((f) => form[f] !== original[f]);
    });
    return out;
  }, [form, original]);

  if (isLoading || !form) return <OrganizationTab.Skeleton />;

  async function saveSection(section: SectionKey) {
    if (!form || !original) return;
    const payload: Partial<OrgFormFields> = {};
    SECTION_FIELDS[section].forEach((f) => {
      if (form[f] !== original[f]) {
        (payload as Record<string, unknown>)[f] = form[f];
      }
    });
    if (Object.keys(payload).length === 0) return;
    setJustSavedSection(null);
    setSavingSection(section);
    try {
      await updateOrganizationSettings(payload);
      setOriginal({ ...original, ...payload });
      setJustSavedSection(section);
      if (flashTimer.current) clearTimeout(flashTimer.current);
      flashTimer.current = setTimeout(() => setJustSavedSection(null), SAVED_FLASH_MS);
    } catch {
      // toast handled in hook
    } finally {
      setSavingSection(null);
    }
  }

  function buildAction(section: SectionKey) {
    return (
      <SectionSaveButton
        dirty={dirtyBySection[section]}
        isPending={savingSection === section}
        justSaved={justSavedSection === section}
        onSave={() => saveSection(section)}
      />
    );
  }

  const sections = (
    <div className="space-y-5">
      <OrganizationIdentitySettingsTab form={form} setForm={setForm} saveAction={buildAction("identity")} />
      <RiskWeightsSettingsTab form={form} setForm={setForm} saveAction={buildAction("riskWeights")} />
      <HealthWeightSettingsTab form={form} setForm={setForm} saveAction={buildAction("health")} />
    </div>
  );

  if (!previewVisible) return sections;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-5 items-start">
      <div className="min-w-0">{sections}</div>
      <div className="lg:sticky lg:top-0">
        <ScenarioPreviewCard form={form} flash />
      </div>
    </div>
  );
}

OrganizationTab.Skeleton = function OrganizationTabSkeleton() {
  return (
    <div className="space-y-5">
      <OrganizationIdentitySettingsTab.Skeleton />
      <RiskWeightsSettingsTab.Skeleton />
      <HealthWeightSettingsTab.Skeleton />
    </div>
  );
};
