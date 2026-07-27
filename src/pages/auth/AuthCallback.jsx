/* صفحة استقبال الـ token بعد OAuth */
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const AuthCallback = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  /* استقبال الـ token من الـ URL وحفظه */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const error = params.get('error');

    if (error) {
      navigate('/login?error=oauth_failed');
      return;
    }

    if (token) {
      // Store token first so api interceptor can use it
      localStorage.setItem('token', token);
      
      // Fetch user profile to get the role
      api.get('/profile')
        .then(res => {
          const user = res.data.data;
          login(user, token);
          if (user.role === 'pending') {
            navigate('/role-selection');
          } else {
            navigate(`/${user.role}/home`);
          }
        })
        .catch(err => {
          navigate('/login?error=profile_fetch_failed');
        });
    } else {
      navigate('/login');
    }
  }, []);

  return (
    <div className="auth-callback">
      <p>Loading...</p>
    </div>
  );
};

export default AuthCallback;
