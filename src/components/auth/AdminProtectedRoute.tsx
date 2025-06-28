import { ReactNode, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { AdminAuth } from '@/lib/adminAuth';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface AdminProtectedRouteProps {
  children: ReactNode;
}

export default function AdminProtectedRoute({ children }: AdminProtectedRouteProps) {
  const [isVerifying, setIsVerifying] = useState(true);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  useEffect(() => {
    const verifyAdminAuth = () => {
      setIsVerifying(true);
      const isLoggedIn = AdminAuth.isAdminLoggedIn();
      setIsAdminLoggedIn(isLoggedIn);
      setIsVerifying(false);
    };

    verifyAdminAuth();
  }, []);

  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAdminLoggedIn) {
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
}
