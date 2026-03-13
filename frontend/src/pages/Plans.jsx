import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// This page redirects to dashboard - subscription is now handled in dashboard
const Plans = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    navigate('/dashboard', { replace: true });
  }, [navigate]);

  return null;
};

export default Plans;
