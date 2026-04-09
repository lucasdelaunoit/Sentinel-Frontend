import { createContext, useContext, type ReactNode } from "react";

interface PageContextType {
  title?: string;
  subtitle?: string;
}

const PageContext = createContext<PageContextType>({});

export function usePage() {
  return useContext(PageContext);
}

export function PageProvider({
  children,
  title,
  subtitle,
}: {
  children: ReactNode;
  title?: string;
  subtitle?: string;
}) {
  return (
    <PageContext.Provider value={{ title, subtitle }}>
      {children}
    </PageContext.Provider>
  );
}
