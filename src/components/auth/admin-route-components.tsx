import { Navigate } from "react-router-dom";
import { fine } from "@/lib/fine";
import { useAdminStatus } from "@/hooks/use-admin";

export const AdminProtectedRoute = ({ 
  Component,
  requireSuperAdmin = false
}: { 
  Component: () => JSX.Element;
  requireSuperAdmin?: boolean;
}) => {
  const { data: session, isPending } = fine.auth.useSession();
  const { isAdmin, isSuperAdmin, isLoading } = useAdminStatus();

  if (isPending || isLoading) return <div>Loading...</div>;
  
  if (!session?.user) {
    return <Navigate to='/login' />;
  }
  
  // Special case for pdarleyjr@gmail.com - always allow access
  if (session.user.email === 'pdarleyjr@gmail.com') {
    return <Component />;
  }
  
  if (requireSuperAdmin && !isSuperAdmin) {
    return <Navigate to='/' />;
  }
  
  if (!isAdmin) {
    return <Navigate to='/' />;
  }
  
  return <Component />;
};