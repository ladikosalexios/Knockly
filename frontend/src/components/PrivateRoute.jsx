import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import axios from "axios";

const PrivateRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    axios.get("http://localhost:3000/api/users/me", {
      withCredentials: true
    })
    .then(() => setIsAuthenticated(true))
    .catch(() => setIsAuthenticated(false));
  }, []);

  if (isAuthenticated === null) return null; // or loading spinner

  return isAuthenticated ? children : <Navigate to="/login" />;
};

export default PrivateRoute;