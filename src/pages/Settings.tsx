import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import TopBar from "@/components/layout/topbar/TopBar.tsx";
import SkillsTab from "@/components/specified/pages/settings/SkillsTab.tsx";
import RulesTab from "@/components/specified/pages/settings/RulesTab.tsx";
import { BookOpenIcon, CalendarIcon, ShieldIcon, SlidersIcon } from "@phosphor-icons/react";
import CalendarTab from "@/components/specified/pages/settings/CalendarTab.tsx";
import OrganizationTab from "@/components/specified/pages/settings/OrganizationTab.tsx";

export default function Settings() {
  return (
    <>
      <TopBar title="Settings" />
      <div className="flex-1 overflow-y-auto p-6 space-y-5 page-enter">
        <Tabs defaultValue="organization">
          <TabsList>
            {(
              [
                { value: "organization", label: "Organization", icon: ShieldIcon },
                { value: "skills", label: "Skills", icon: BookOpenIcon },
                { value: "rules", label: "Rules", icon: SlidersIcon },
                { value: "calendar", label: "Calendar", icon: CalendarIcon },
              ] as const
            ).map(({ value, label, icon: Icon }) => (
              <TabsTrigger key={value} value={value}>
                <Icon className="size-4" />
                {label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="organization" className="mt-5">
            <OrganizationTab />
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
