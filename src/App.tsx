import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";
import "./App.css";
import RootLayout from "./components/layout/RootLayout";
import ProtectedLayout from "./components/layout/ProtectedLayout";
import Dashboard from "./pages/Dashboard";
import Employees from "./pages/Employees";
import EmployeeDetail from "./pages/EmployeeDetail";
import Projects from "./pages/Projects";
import ProjectDetail from "./pages/ProjectDetail";
import Settings from "./pages/Settings";
import Planning from "./pages/Planning";
import Login from "./pages/Login";
import Profile from "./pages/Profile";

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: "/", element: <Navigate to="/dashboard" replace /> },
      { path: "*", element: <Navigate to="/dashboard" replace /> },
      { path: "/login", element: <Login /> },
      {
        element: <ProtectedLayout />,
        children: [
          { path: "/dashboard", element: <Dashboard /> },
          { path: "/employees", element: <Employees /> },
          { path: "/employees/:id", element: <EmployeeDetail /> },
          { path: "/projects", element: <Projects /> },
          { path: "/projects/:id", element: <ProjectDetail /> },
          { path: "/planning", element: <Planning /> },
          { path: "/profile", element: <Profile /> },
          { path: "/settings", element: <Settings /> },
        ],
      },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
