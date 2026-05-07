import { Outlet } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { PageProvider } from "@/context/PageContext";

export default function RootLayout() {
  return (
    <AuthProvider>
      <PageProvider>
        <Outlet />
      </PageProvider>
    </AuthProvider>
  );
}
