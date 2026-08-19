import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Interview from "./pages/Interview";
import InterviewSetup from "./pages/InterviewSetup";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import History from "./pages/History";
import Performance from "./pages/Performance";
import InterviewResult from "./pages/InterviewResult";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          <Route element={<ProtectedRoute />}>
  <Route path="/dashboard" element={<Dashboard />} />
  <Route path="/interview/setup" element={<InterviewSetup />} />
  <Route path="/interview" element={<Interview />} />
  <Route path="/history" element={<History />} />
  <Route path="/performance" element={<Performance />} />
  <Route path="/interview/result/:id" element={<InterviewResult />}/>
  <Route path="/profile" element={<Profile />}/>
  <Route path="/settings" element={<Settings />} />

</Route>

          <Route
            path="*"
            element={<Navigate to="/dashboard" replace />}
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;