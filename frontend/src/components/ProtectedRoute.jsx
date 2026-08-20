// frontend/src/components/ProtectedRoute.jsx
// Verifies admin authentication on the backend before rendering protected pages.

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAdminMe } from '../services/api.js';
import { PageLoading } from './Loading.jsx';

export default function ProtectedRoute({ children }) {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    getAdminMe()
      .then(() => {
        setAuthorized(true);
      })
      .catch(() => {
        navigate('/admin/login', { replace: true });
      })
      .finally(() => {
        setChecking(false);
      });
  }, [navigate]);

  if (checking) return <PageLoading />;
  if (!authorized) return null;

  return children;
}
