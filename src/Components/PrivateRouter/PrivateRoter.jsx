import { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import AuthContext from "../Context/AuthContext";

const PrivateRouter = ({ children }) => {
  const { user, loading, isAdmin } = useContext(AuthContext);
  const location = useLocation();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  // Check if user role is loaded
  if (!user.role) {
    return <div>Loading user data...</div>;
  }

  // Only allow doctors and admins
  if (user.role !== "doctor" && user.role !== "admin" && !isAdmin) {
    return <Navigate to="/patient" replace />;
  }

  return children;
};

export default PrivateRouter;
