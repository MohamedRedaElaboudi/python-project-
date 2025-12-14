import { BrowserRouter, Routes, Route } from "react-router-dom";

import ChooseRole from "./pages/ChooseRole";
import Login from "./pages/Login";
import Register from "./pages/Register";
import StudentRegister from "./pages/student/StudentRegister";
import StudentDashboard from "./pages/student/dashboard";
import UploadRapport from "./pages/student/upload-rapport";
import StudentSoutenance from "./pages/student/soutenance";
import MesRapports from "./pages/student/mes-rapports";

import StudentGuard from "./StudentGuard";
import StudentLayout from "./pages/student/StudentLayout";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* PAGE DE CHOIX */}
        <Route path="/" element={<ChooseRole />} />

        {/* PUBLIC */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/register/student" element={<StudentRegister />} />

        {/* ETUDIANT */}
        <Route element={<StudentGuard />}>
          <Route path="/student" element={<StudentLayout />}>
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="upload" element={<UploadRapport />} />
            <Route path="mes-rapports" element={<MesRapports />} />
            <Route path="soutenance" element={<StudentSoutenance />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
