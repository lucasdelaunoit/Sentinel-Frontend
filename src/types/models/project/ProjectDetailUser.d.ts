/** User as embedded in GET /projects/:id. */
interface ProjectDetailUser {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  title: string;
  is_remote: boolean;
  status: UserStatus;
  department: { id: number; name: string };
}
