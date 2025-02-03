import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/stores/useAuth";
import { useEffect } from "react";
import Loader from "@/components/Loader/Loader";

const ProtectedRoute = () => {
  const { isAuthenticated, isLoading, checkAuth } = useAuth();

  useEffect(() => {
    checkAuth();
  }, []);

  if (isLoading) {
    return <Loader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
