import { Routes, Route } from "react-router-dom";
import "./App.css";
import Sidebar from "./components/layout/Sidebar";
import Dashboard from "./pages/Dashboard";
import Employees from "./pages/Employees";
import EmployeeDetail from "./pages/EmployeeDetail";
import Projects from "./pages/Projects";
import ProjectDetail from "./pages/ProjectDetail";
import Settings from "./pages/Settings";
import Planning from "./pages/Planning";
import Login from "./pages/Login";
import { PageProvider } from "./context/PageContext";

function AppShell() {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/employees" element={<Employees />} />
          <Route path="/employees/:id" element={<EmployeeDetail />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/:id" element={<ProjectDetail />} />
          <Route path="/planning" element={<Planning />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <PageProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<AppShell />} />
      </Routes>
    </PageProvider>
  );
}
