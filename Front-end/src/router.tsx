import { BrowserRouter, Routes, Route } from "react-router-dom";
import StudentGuard from "./StudentGuard";

import ChooseRole from "./pages/ChooseRole";
import Login from "./pages/Login";
import Register from "./pages/Register";
import StudentRegister from "./pages/student/StudentRegister";

import StudentLayout from "./pages/student/StudentLayout";
import StudentDashboard from "./pages/student/dashboard";
import UploadRapport from "./pages/student/upload-rapport";
import MesRapports from "./pages/student/mes-rapports";
import StudentSoutenance from "./pages/student/soutenance";
import StudentProfile from "./pages/student/StudentProfile";
import EditStudentProfile from "./pages/student/EditStudentProfile";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* PUBLIC */}
        <Route path="/" element={<ChooseRole />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/register/student" element={<StudentRegister />} />

        {/* STUDENT */}
        <Route element={<StudentGuard />}>
          <Route path="/student" element={<StudentLayout />}>
            <Route index element={<StudentDashboard />} />
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="upload" element={<UploadRapport />} />
            <Route path="mes-rapports" element={<MesRapports />} />
            <Route path="soutenance" element={<StudentSoutenance />} />
            <Route path="profile" element={<StudentProfile />} />
            <Route path="profile/edit" element={<EditStudentProfile />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
