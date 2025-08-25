import React from 'react';
import { Navigate,useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children,allowedRoles }) => {
    const isAuthenticated = Boolean(localStorage.getItem('token'));  // This should ideally come from context or Redux
    const userRole = localStorage.getItem('role'); // Retrieve the role from localStorage
    const location = useLocation(); // To retain the attempted location for possible redirection after login
    console.log("Authenticated:", isAuthenticated, "Role:", userRole, "Allowed:", allowedRoles);


    if (isAuthenticated && allowedRoles.includes(userRole)) {
      return children;  // User is authorized and can access the route
    }else if (!isAuthenticated) {
      // If not authenticated, redirect to login page
      return isAuthenticated ? children : <Navigate to="/login" replace />;
    }else {
      // If authenticated but not authorized by role, redirect to an unauthorized page or home
      return <Navigate to="/" state={{ from: location }} replace />;
  }
  };

export default ProtectedRoute;