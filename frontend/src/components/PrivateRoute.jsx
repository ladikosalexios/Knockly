import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import api from "../api";

const PrivateRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    api.get("/api/users/me")
    .then(() => setIsAuthenticated(true))
    .catch(() => setIsAuthenticated(false));
  }, []);

  if (isAuthenticated === null) return null; // or loading spinner

  return isAuthenticated ? children : <Navigate to="/login" />;
};

export default PrivateRoute;