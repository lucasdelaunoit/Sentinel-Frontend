import { Routes, Route } from "react-router-dom";
import "./App.css";
import Sidebar from "./components/layout/Sidebar";
import TopBar from "./components/layout/TopBar";
import Dashboard from "./pages/Dashboard";
import Employees from "./pages/Employees";
import EmployeeDetail from "./pages/EmployeeDetail";
import Projects from "./pages/Projects";
import ProjectDetail from "./pages/ProjectDetail";
import { PageProvider } from "./context/PageContext";

export default function App() {
  return (
    <PageProvider>
      <div className="flex h-screen overflow-hidden bg-background">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <TopBar />
          <main className="flex-1 overflow-y-auto p-6">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/employees" element={<Employees />} />
              <Route path="/employees/:id" element={<EmployeeDetail />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/projects/:id" element={<ProjectDetail />} />
            </Routes>
          </main>
        </div>
      </div>
    </PageProvider>
  );
}
