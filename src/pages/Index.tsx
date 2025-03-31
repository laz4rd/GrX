
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Index: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/');
  }, [navigate]);

  return (
    <div className="h-screen w-screen flex items-center justify-center">
      <p>Redirecting...</p>
    </div>
  );
};

export default Index;
