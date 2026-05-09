import axiosClient from "@/api/axiosClient"

export interface AuthUser {
  id: number
  firstname: string
  lastname: string
  email: string
}

interface LoginResponse {
  token: string
  user: AuthUser
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  const { data } = await axiosClient.post<LoginResponse>("/api/auth/login", { email, password })
  return data
}

export async function logout(): Promise<void> {
  try {
    await axiosClient.post("/api/auth/logout")
  } catch {
    /* logout best-effort: clear local state regardless */
  }
}

export async function fetchCurrentUser(): Promise<AuthUser> {
  const { data } = await axiosClient.get<AuthUser | { user: AuthUser }>("/api/auth/me")
  return "user" in (data as object) ? (data as { user: AuthUser }).user : (data as AuthUser)
}
