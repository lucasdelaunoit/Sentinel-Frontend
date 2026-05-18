import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import useGetOrganizationSettings from "@/api/organization/useGetOrganizationSettings";
import useUpdateOrganizationSettings from "@/api/organization/useUpdateOrganizationSettings";
import OrganizationIdentitySettingsTab from "./organizationTab/OrganizationIdentitySettingsTab";
import RiskWeightsSettingsTab from "./organizationTab/RiskWeightsSettingsTab";
import RulesSettingsTab from "./organizationTab/RulesSettingsTab";
import HealthWeightSettingsTab from "./organizationTab/HealthWeightSettingsTab";
import type { OrgFormFields } from "./organizationTab/types";

export default function OrganizationTab() {
  const { data, isLoading } = useGetOrganizationSettings();
  const update = useUpdateOrganizationSettings();
  const [form, setForm] = useState<OrgFormFields | null>(null);

  useEffect(() => {
    if (data) {
      setForm({
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
      });
    }
  }, [data]);

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

  const saved = update.isSuccess && !update.isPending;

  return (
    <div className="space-y-5">
      <OrganizationIdentitySettingsTab form={form} setForm={setForm} />
      <RiskWeightsSettingsTab form={form} setForm={setForm} />
      <RulesSettingsTab form={form} setForm={setForm} />
      <HealthWeightSettingsTab form={form} setForm={setForm} />

      <div className="flex justify-end">
        <Button onClick={() => update.mutate(form)} disabled={update.isPending} className="gap-2" size="lg">
          {saved && <Check className="size-4" />}
          {update.isPending ? "Saving…" : saved ? "Saved" : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
