import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Logout = ({ setIsLoggedIn }) => {
  const navigate = useNavigate();
  const [message, setMessage] = useState('Logging you out...');

  useEffect(() => {
    const logoutUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          await fetch('/api/logout', {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ auth: token })
          });
        } catch (err) {
          console.error('Logout API failed:', err);
        }
      }

      // Clear token & state regardless
      localStorage.removeItem('token');
      setIsLoggedIn(false);
      setMessage('Logout Successful!');
      setTimeout(() => navigate('/'), 1500);
    };

    logoutUser();
  }, [navigate, setIsLoggedIn]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <h1 className="text-xl text-indigo-700">{message}</h1>
    </div>
  );
};

export default Logout;
