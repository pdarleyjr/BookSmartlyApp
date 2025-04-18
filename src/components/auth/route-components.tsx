import { Navigate } from "react-router-dom";
import { fine } from "@/lib/fine";

export const ProtectedRoute = ({ Component }: { Component: () => JSX.Element }) => {
  const { data: session, isPending } = fine.auth.useSession();

  if (isPending) return <div>Loading...</div>;
  
  if (!session?.user) {
    return <Navigate to='/login' />;
  }
  
  return <Component />;
};