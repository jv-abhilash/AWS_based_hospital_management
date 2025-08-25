import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const withRoleAccess = (WrappedComponent, allowedRoles) => {
  return props => {
    const navigate = useNavigate();
    const { role } = props;

    useEffect(() => {
      if (!allowedRoles.includes(role)) {
        navigate('/');  // Redirect to an unauthorized access page or home
      }
    }, [role, navigate]);

    return <WrappedComponent {...props} />;
  };
};

export default withRoleAccess;
