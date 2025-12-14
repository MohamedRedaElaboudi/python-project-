import { Outlet, Navigate } from "react-router-dom";

export default function StudentGuard() {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (role !== "student") {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}
