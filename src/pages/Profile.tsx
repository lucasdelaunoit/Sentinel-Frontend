import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  Mail,
  Phone,
  MapPin,
  Building2,
  Briefcase,
  Calendar,
  LogOut,
  Camera,
  Pencil,
} from "lucide-react";
import TopBar from "@/components/layout/TopBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ComposedCard from "@/components/common/cards/ComposedCard";

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

const INITIAL_PROFILE: Profile = {
  firstName: "Admin",
  lastName: "User",
  email: "admin@sentinel.io",
  phone: "+33 6 12 34 56 78",
  role: "Manager",
  department: "Operations",
  location: "Brussels, BE",
  joinedAt: "2024-09-01",
  initials: "AD",
};

export default function ProfilePage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile>(INITIAL_PROFILE);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Profile>(INITIAL_PROFILE);

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
  function handleLogout() {
    try {
      localStorage.removeItem("sentinel.auth");
      sessionStorage.removeItem("sentinel.auth");
    } catch {
      /* ignore */
    }
    navigate("/login");
  }

  const fullName = `${profile.firstName} ${profile.lastName}`.trim();

  return (
    <>
      <TopBar
        title="Profile"
        actions={
          <Button
            variant="outline"
            size="lg"
            onClick={handleLogout}
            className="gap-2 text-rose-600 hover:text-rose-600 hover:bg-rose-50 border-rose-200/60"
          >
            <LogOut className="size-4" />
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
                <button
                  type="button"
                  className="absolute -right-1 -bottom-1 grid size-7 place-content-center rounded-full bg-card border border-border text-muted-foreground hover:text-foreground transition-colors shadow-sm"
                  title="Change avatar"
                >
                  <Camera className="size-3.5" />
                </button>
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
                  <Pencil className="size-4" />
                  Edit profile
                </Button>
              )}
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-3">
            <InfoChip icon={<Mail className="size-3.5" />} label="Email" value={profile.email} />
            <InfoChip icon={<Phone className="size-3.5" />} label="Phone" value={profile.phone} />
            <InfoChip icon={<MapPin className="size-3.5" />} label="Location" value={profile.location} />
            <InfoChip
              icon={<Calendar className="size-3.5" />}
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
                  <Field label="Role" icon={<Briefcase className="size-3.5" />}>
                    <Input
                      disabled={!editing}
                      value={editing ? draft.role : profile.role}
                      onChange={(e) => setDraft({ ...draft, role: e.target.value })}
                    />
                  </Field>
                  <Field label="Department" icon={<Building2 className="size-3.5" />}>
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

        {/* ── Danger zone ───────────────────────────────────────── */}
        <section className="rounded-2xl border border-rose-200/60 bg-rose-50/30 p-5">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h3 className="text-sm font-semibold text-rose-700">Sign out of Sentinel</h3>
              <p className="text-[12px] text-rose-700/70 mt-1">
                You will be returned to the login screen. Your data will be preserved.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="gap-2 border-rose-300/60 text-rose-600 hover:bg-rose-100 hover:text-rose-700"
            >
              <LogOut className="size-4" />
              Sign out
            </Button>
          </div>
        </section>
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

