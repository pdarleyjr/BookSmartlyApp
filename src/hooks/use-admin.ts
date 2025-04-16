import { useState, useEffect } from "react";
import { fine } from "@/lib/fine";
import { adminApi } from "@/api/admin";

export function useAdminStatus() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isOrgAdmin, setIsOrgAdmin] = useState(false);
  const [organizationId, setOrganizationId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { data: session } = fine.auth.useSession();

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!session?.user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        // Special case for pdarleyjr@gmail.com - always super admin
        if (session.user.email === 'pdarleyjr@gmail.com') {
          setIsAdmin(true);
          setIsSuperAdmin(true);
          setIsOrgAdmin(false);
          setOrganizationId(null);
          setIsLoading(false);
          return;
        }

        const status = await adminApi.checkAdminStatus(session.user.id);
        setIsAdmin(status.isAdmin);
        setIsSuperAdmin(status.isSuperAdmin);
        setIsOrgAdmin(status.isOrgAdmin);
        setOrganizationId(status.organizationId);
      } catch (error) {
        console.error("Error checking admin status:", error);
        
        // Special case for pdarleyjr@gmail.com - always super admin
        if (session.user.email === 'pdarleyjr@gmail.com') {
          setIsAdmin(true);
          setIsSuperAdmin(true);
          setIsOrgAdmin(false);
          setOrganizationId(null);
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminStatus();
  }, [session?.user?.id, session?.user?.email]);

  return { isAdmin, isSuperAdmin, isOrgAdmin, organizationId, isLoading };
}