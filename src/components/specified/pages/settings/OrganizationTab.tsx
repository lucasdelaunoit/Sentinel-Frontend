import { useEffect, useMemo, useRef, useState } from "react";
import useGetOrganizationSettings from "@/api/organization/useGetOrganizationSettings";
import useUpdateOrganizationSettings from "@/api/organization/useUpdateOrganizationSettings";
import OrganizationIdentitySettingsTab from "./organizationTab/OrganizationIdentitySettingsTab";
import RiskWeightsSettingsTab from "./organizationTab/RiskWeightsSettingsTab";
import RulesSettingsTab from "./organizationTab/RulesSettingsTab";
import HealthWeightSettingsTab from "./organizationTab/HealthWeightSettingsTab";
import SectionSaveButton from "./organizationTab/SectionSaveButton";
import type { OrgFormFields } from "./organizationTab/types";

type SectionKey = "identity" | "riskWeights" | "rules" | "health";

const SECTION_FIELDS: Record<SectionKey, (keyof OrgFormFields)[]> = {
  identity: ["name", "risk_tolerance"],
  riskWeights: [
    "risk_weight_bus_factor",
    "risk_weight_uncovered_skills",
    "risk_weight_silos",
    "risk_weight_absence_impact",
  ],
  rules: [
    "silo_threshold",
    "kci_min_level",
    "critical_bus_factor_threshold",
    "absence_horizon_days",
    "rule_violation_penalty",
  ],
  health: ["health_risk_weight"],
};

const SAVED_FLASH_MS = 2000;

function formFromData(data: NonNullable<ReturnType<typeof useGetOrganizationSettings>["data"]>): OrgFormFields {
  return {
    name: data.name,
    risk_tolerance: data.risk_tolerance,
    risk_weight_bus_factor: data.risk_weight_bus_factor,
    risk_weight_uncovered_skills: data.risk_weight_uncovered_skills,
    risk_weight_silos: data.risk_weight_silos,
    risk_weight_absence_impact: data.risk_weight_absence_impact,
    silo_threshold: data.silo_threshold,
    kci_min_level: data.kci_min_level,
    health_risk_weight: data.health_risk_weight,
    absence_horizon_days: data.absence_horizon_days,
    critical_bus_factor_threshold: data.critical_bus_factor_threshold,
    rule_violation_penalty: data.rule_violation_penalty,
  };
}

export default function OrganizationTab() {
  const { data, isLoading } = useGetOrganizationSettings();
  const { updateOrganizationSettings } = useUpdateOrganizationSettings();
  const [form, setForm] = useState<OrgFormFields | null>(null);
  const [original, setOriginal] = useState<OrgFormFields | null>(null);
  const [justSavedSection, setJustSavedSection] = useState<SectionKey | null>(null);
  const [savingSection, setSavingSection] = useState<SectionKey | null>(null);
  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (data) {
      const snapshot = formFromData(data);
      setForm(snapshot);
      setOriginal(snapshot);
    }
  }, [data]);

  useEffect(() => {
    return () => {
      if (flashTimer.current) clearTimeout(flashTimer.current);
    };
  }, []);

  const dirtyBySection = useMemo(() => {
    const out: Record<SectionKey, boolean> = { identity: false, riskWeights: false, rules: false, health: false };
    if (!form || !original) return out;
    (Object.keys(SECTION_FIELDS) as SectionKey[]).forEach((key) => {
      out[key] = SECTION_FIELDS[key].some((f) => form[f] !== original[f]);
    });
    return out;
  }, [form, original]);

  if (isLoading || !form) {
    return (
      <div className="space-y-5">
        <OrganizationIdentitySettingsTab.Skeleton />
        <RiskWeightsSettingsTab.Skeleton />
        <RulesSettingsTab.Skeleton />
        <HealthWeightSettingsTab.Skeleton />
      </div>
    );
  }

  async function saveSection(section: SectionKey) {
    if (!form) return;
    setJustSavedSection(null);
    setSavingSection(section);
    try {
      await updateOrganizationSettings(form);
      setOriginal(form);
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

  return (
    <div className="space-y-5">
      <OrganizationIdentitySettingsTab form={form} setForm={setForm} saveAction={buildAction("identity")} />
      <RiskWeightsSettingsTab form={form} setForm={setForm} saveAction={buildAction("riskWeights")} />
      <RulesSettingsTab form={form} setForm={setForm} saveAction={buildAction("rules")} />
      <HealthWeightSettingsTab form={form} setForm={setForm} saveAction={buildAction("health")} />
    </div>
  );
}
