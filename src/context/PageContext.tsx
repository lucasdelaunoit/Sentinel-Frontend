import { createContext, useContext, useState, type ReactNode } from "react";

interface PageContextType {
  title: string;
  breadcrumb: string;
  setTitle: (t: string) => void;
  setBreadcrumb: (b: string) => void;
}

const PageContext = createContext<PageContextType>({
  title: "",
  breadcrumb: "",
  setTitle: () => {},
  setBreadcrumb: () => {},
});

export function usePage() {
  return useContext(PageContext);
}

export function PageProvider({ children }: { children: ReactNode }) {
  const [title, setTitle] = useState("");
  const [breadcrumb, setBreadcrumb] = useState("");
  return (
    <PageContext.Provider value={{ title, breadcrumb, setTitle, setBreadcrumb }}>
      {children}
    </PageContext.Provider>
  );
}
