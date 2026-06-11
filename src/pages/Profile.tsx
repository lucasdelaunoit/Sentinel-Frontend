import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { BriefcaseIcon, BuildingsIcon, CalendarIcon, CameraIcon, EnvelopeIcon, MapPinIcon, PencilSimpleIcon, PhoneIcon, SignOutIcon } from "@phosphor-icons/react";
import TopBar from "@/components/layout/topbar/TopBar.tsx";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ComposedCard from "@/components/common/cards/ComposedCard";
import { useAuth } from "@/context/AuthContext";

type Profile = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  location: string;
  joinedAt: string;
  initials: string;
};

const FALLBACK_PROFILE: Profile = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "—",
  role: "Member",
  department: "—",
  location: "—",
  joinedAt: new Date().toISOString(),
  initials: "?",
};

function buildProfileFromUser(user: { firstname: string; lastname: string; email: string } | null): Profile {
  if (!user) return FALLBACK_PROFILE;
  const firstName = user.firstname;
  const lastName = user.lastname;
  const initials = ((firstName[0] ?? "") + (lastName[0] ?? "")).toUpperCase() || "?";
  return { ...FALLBACK_PROFILE, firstName, lastName, email: user.email, initials };
}

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState<Profile>(() => buildProfileFromUser(user));
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Profile>(() => buildProfileFromUser(user));
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    const next = buildProfileFromUser(user);
    setProfile(next);
    setDraft(next);
  }, [user]);

  function startEdit() {
    setDraft(profile);
    setEditing(true);
  }
  function cancelEdit() {
    setDraft(profile);
    setEditing(false);
  }
  function saveEdit(e: FormEvent) {
    e.preventDefault();
    setProfile(draft);
    setEditing(false);
  }
  async function handleLogout() {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await logout();
      toast.success("Signed out");
    } catch {
      toast.error("Could not sign out cleanly. Session cleared locally.");
    } finally {
      setLoggingOut(false);
    }
  }

  const fullName = `${profile.firstName} ${profile.lastName}`.trim();

  return (
    <>
      <TopBar
        title="Profile"
        breadcrumb={[{ label: "Profile" }]}
        actions={
          <Button
            variant="outline"
            size="lg"
            onClick={handleLogout}
            disabled={loggingOut}
            className="gap-2 text-rose-600 hover:text-rose-600 hover:bg-rose-50 border-rose-200/60"
          >
            <SignOutIcon className="size-4" />
            Sign out
          </Button>
        }
      />
      <div className="flex-1 overflow-y-auto p-6 space-y-5 page-enter">
        {/* ── Hero card ─────────────────────────────────────────── */}
        <section className="rounded-2xl bg-card border border-border/60 shadow-sm p-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="flex size-20 items-center justify-center rounded-2xl bg-secondary-foreground text-xl font-bold text-primary-foreground shadow-md">
                  {profile.initials}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="icon-sm"
                  className="absolute -right-1 -bottom-1 rounded-full bg-card text-muted-foreground shadow-sm"
                  title="Change avatar"
                >
                  <CameraIcon className="size-3.5" />
                </Button>
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tight text-foreground">{fullName}</h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {profile.role} · {profile.department}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              {editing ? (
                <>
                  <Button variant="outline" onClick={cancelEdit}>
                    Cancel
                  </Button>
                  <Button onClick={saveEdit}>Save changes</Button>
                </>
              ) : (
                <Button variant="outline" onClick={startEdit} className="gap-2">
                  <PencilSimpleIcon className="size-4" />
                  Edit profile
                </Button>
              )}
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-3">
            <InfoChip icon={<EnvelopeIcon className="size-3.5" />} label="Email" value={profile.email} />
            <InfoChip icon={<PhoneIcon className="size-3.5" />} label="Phone" value={profile.phone} />
            <InfoChip icon={<MapPinIcon className="size-3.5" />} label="Location" value={profile.location} />
            <InfoChip
              icon={<CalendarIcon className="size-3.5" />}
              label="Member since"
              value={new Date(profile.joinedAt).toLocaleDateString("en-GB", {
                month: "short",
                year: "numeric",
              })}
            />
          </div>
        </section>

        {/* ── Account ───────────────────────────────────────────── */}
        <form onSubmit={saveEdit} className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <ComposedCard title="Personal info" className="lg:col-span-2 gap-4">
            <p className="text-[12px] text-muted-foreground -mt-1">Identity and contact details</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <Field label="First name">
                <Input
                  disabled={!editing}
                  value={editing ? draft.firstName : profile.firstName}
                  onChange={(e) => setDraft({ ...draft, firstName: e.target.value })}
                />
              </Field>
              <Field label="Last name">
                <Input
                  disabled={!editing}
                  value={editing ? draft.lastName : profile.lastName}
                  onChange={(e) => setDraft({ ...draft, lastName: e.target.value })}
                />
              </Field>
              <Field label="Email">
                <Input
                  type="email"
                  disabled={!editing}
                  value={editing ? draft.email : profile.email}
                  onChange={(e) => setDraft({ ...draft, email: e.target.value })}
                />
              </Field>
              <Field label="Phone">
                <Input
                  disabled={!editing}
                  value={editing ? draft.phone : profile.phone}
                  onChange={(e) => setDraft({ ...draft, phone: e.target.value })}
                />
              </Field>
              <Field label="Location">
                <Input
                  disabled={!editing}
                  value={editing ? draft.location : profile.location}
                  onChange={(e) => setDraft({ ...draft, location: e.target.value })}
                />
              </Field>
            </div>
          </ComposedCard>

          <ComposedCard title="Work" className="gap-4">
            <p className="text-[12px] text-muted-foreground -mt-1">Role and team affiliation</p>
            <div className="space-y-4 mt-4">
              <Field label="Role" icon={<BriefcaseIcon className="size-3.5" />}>
                <Input
                  disabled={!editing}
                  value={editing ? draft.role : profile.role}
                  onChange={(e) => setDraft({ ...draft, role: e.target.value })}
                />
              </Field>
              <Field label="Department" icon={<BuildingsIcon className="size-3.5" />}>
                <Input
                  disabled={!editing}
                  value={editing ? draft.department : profile.department}
                  onChange={(e) => setDraft({ ...draft, department: e.target.value })}
                />
              </Field>
              <div className="rounded-xl border border-border/60 bg-muted/20 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Member since
                </p>
                <p className="text-sm font-medium text-foreground">
                  {new Date(profile.joinedAt).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
          </ComposedCard>
        </form>
      </div>
    </>
  );
}

/* ─── Bits ───────────────────────────────────────────────────── */

function InfoChip({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border/60 bg-muted/10 px-3 py-2.5">
      <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
        {icon}
        {label}
      </div>
      <p className="text-[13px] font-medium text-foreground truncate">{value}</p>
    </div>
  );
}

function Field({ label, icon, children }: { label: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {icon}
        {label}
      </label>
      {children}
    </div>
  );
}
