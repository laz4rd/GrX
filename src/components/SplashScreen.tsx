
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SplashScreen: React.FC = () => {
  const [animationComplete, setAnimationComplete] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimationComplete(true);
      setTimeout(() => {
        navigate('/login');
      }, 500); // Wait for fade out animation
    }, 2000); // Show splash for 2 seconds

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className={`h-screen w-screen flex flex-col items-center justify-center bg-nothing-black dot-matrix transition-opacity duration-500 ${animationComplete ? 'opacity-0' : 'opacity-100'}`}>
      <div className="relative">
        <div className="text-nothing-white text-5xl font-bold mb-2 tracking-tighter">
          Shvik<span className="text-nothing-red">.</span>
        </div>
        <div className="text-nothing-lightgray text-sm mt-4">
          minimalist messaging
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
