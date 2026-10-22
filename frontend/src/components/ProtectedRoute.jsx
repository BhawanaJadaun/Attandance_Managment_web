
import React from "react";
import {
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ allowedRoles }) => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  // 1. Block users who are not logged in
  if (!isAuthenticated || !user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  // 2. Check whether the logged-in user has permission
  const userRole = user.role?.toLowerCase();

  if (
    allowedRoles &&
    allowedRoles.length > 0 &&
    !allowedRoles.map((role) => role.toLowerCase()).includes(userRole)
  ) {
    return (
      <Navigate
        to="/unauthorized"
        replace
      />
    );
  }

  // 3. Allow authorized users to access the page
  return <Outlet />;
};

export default ProtectedRoute;
