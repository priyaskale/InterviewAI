import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="route-loading">
        <div className="loading-spinner" />
        <p>Loading InterviewAI...</p>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;