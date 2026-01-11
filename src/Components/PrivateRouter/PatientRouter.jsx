import { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import AuthContext from "../Context/AuthContext";

const PatientRouter = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  // If user role is not yet loaded, show loading
  if (!user.role) {
    return <div>Loading user data...</div>;
  }

  // If user is doctor or admin, redirect to doctor page
  if (user.role === "doctor" || user.role === "admin") {
    return <Navigate to="/doctor" replace />;
  }

  // Only allow users with "user" role
  if (user.role !== "user") {
    return <Navigate to="/doctor" replace />;
  }

  return children;
};

export default PatientRouter;
