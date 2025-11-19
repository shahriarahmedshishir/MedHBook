import { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import AuthContext from "../Context/AuthContext";

const PrivateRouter = ({ children }) => {
  const { user, loading, isAdmin } = useContext(AuthContext);
  const location = useLocation();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user || !isAdmin) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  return children;
};

export default PrivateRouter;
