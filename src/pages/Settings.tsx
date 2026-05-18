import { useEffect, useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import TopBar from "@/components/layout/topbar/TopBar.tsx";
import SkillsTab from "@/components/specified/pages/settings/SkillsTab.tsx";
import RulesTab from "@/components/specified/pages/settings/RulesTab.tsx";
import { BookOpenIcon, CalendarIcon, ShieldIcon, SlidersIcon } from "@phosphor-icons/react";
import CalendarTab from "@/components/specified/pages/settings/CalendarTab.tsx";
import OrganizationTab from "@/components/specified/pages/settings/OrganizationTab.tsx";
import { useTabParam } from "@/hooks/useTabParam";

const SETTINGS_TABS = [
  { value: "organization", label: "Organization", icon: ShieldIcon },
  { value: "skills", label: "Skills", icon: BookOpenIcon },
  { value: "rules", label: "Rules", icon: SlidersIcon },
  { value: "calendar", label: "Calendar", icon: CalendarIcon },
];

const PREVIEW_STORAGE_KEY = "sentinel.settings.previewVisible";

function loadPreviewVisible(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(PREVIEW_STORAGE_KEY) === "1";
}

export default function Settings() {
  const [activeTab, setActiveTab] = useTabParam(
    "organization",
    SETTINGS_TABS.map((tab) => tab.value),
  );
  const [previewVisible, setPreviewVisible] = useState<boolean>(loadPreviewVisible);

  useEffect(() => {
    window.localStorage.setItem(PREVIEW_STORAGE_KEY, previewVisible ? "1" : "0");
  }, [previewVisible]);

  const topBarActions =
    activeTab === "organization" ? (
      <Label htmlFor="preview-toggle" className="flex items-center gap-2 text-sm cursor-pointer">
        <span className="text-muted-foreground">Live preview</span>
        <Switch id="preview-toggle" checked={previewVisible} onCheckedChange={setPreviewVisible} />
      </Label>
    ) : null;

  return (
    <>
      <TopBar title="Settings" actions={topBarActions} />
      <div className="flex-1 overflow-y-auto p-6 space-y-5 page-enter">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            {SETTINGS_TABS.map(({ value, label, icon: Icon }) => (
              <TabsTrigger key={value} value={value}>
                <Icon className="size-4" />
                {label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="organization" className="mt-5">
            <OrganizationTab previewVisible={previewVisible} />
          </TabsContent>
          <TabsContent value="skills" className="mt-5">
            <SkillsTab />
          </TabsContent>
          <TabsContent value="rules" className="mt-5">
            <RulesTab />
          </TabsContent>
          <TabsContent value="calendar" className="mt-5">
            <CalendarTab />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
