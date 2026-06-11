/**
 * User as returned by the API (`UserResource`). One resource serves every user
 * endpoint (list, detail, create, update); relations are only present when the
 * endpoint loads them (`whenLoaded`), hence optional.
 */
interface User {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  phone: string | null;
  title: string;
  status: UserStatus;
  department?: { id: number; name: string } | null;
  skills?: UserSkillItem[];
  absences?: Absence[];
  created_at: string;
}
