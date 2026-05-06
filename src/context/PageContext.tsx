import { createContext, useContext, useState, type ReactNode } from "react";

interface PageContextType {
  title: string;
  breadcrumb: string;
  setTitle: (t: string) => void;
  setBreadcrumb: (b: string) => void;
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
}

const PageContext = createContext<PageContextType>({
  title: "",
  breadcrumb: "",
  setTitle: () => {},
  setBreadcrumb: () => {},
  sidebarCollapsed: false,
  toggleSidebar: () => {},
});

export function usePage() {
  return useContext(PageContext);
}

export function PageProvider({ children }: { children: ReactNode }) {
  const [title, setTitle] = useState("");
  const [breadcrumb, setBreadcrumb] = useState("");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <PageContext.Provider
      value={{
        title,
        breadcrumb,
        setTitle,
        setBreadcrumb,
        sidebarCollapsed,
        toggleSidebar: () => setSidebarCollapsed((v) => !v),
      }}
    >
      {children}
    </PageContext.Provider>
  );
}
