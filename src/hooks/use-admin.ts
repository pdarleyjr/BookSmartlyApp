import { useState, useEffect } from "react";
import { fine } from "@/lib/fine";
import { adminApi } from "@/api/admin";

export function useAdminStatus() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isOrgAdmin, setIsOrgAdmin] = useState(false);
  const [organizationId, setOrganizationId] = useState<number | null>(null);
  const [isOrgApproved, setIsOrgApproved] = useState(false);
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
          console.log("Setting pdarleyjr@gmail.com as super admin");
          setIsAdmin(true);
          setIsSuperAdmin(true);
          setIsOrgAdmin(false);
          setOrganizationId(1); // Set a default organization ID
          setIsOrgApproved(true);
          setIsLoading(false);
          return;
        }

        const status = await adminApi.checkAdminStatus(session.user.id);
        setIsAdmin(status.isAdmin);
        setIsSuperAdmin(status.isSuperAdmin);
        setIsOrgAdmin(status.isOrgAdmin);
        setOrganizationId(status.organizationId);
        
        // Check if user is approved for their organization
        if (status.organizationId) {
          try {
            const users = await fine.table("users")
              .select("organizationApproved")
              .eq("id", session.user.id);
            
            if (users && users.length > 0) {
              setIsOrgApproved(users[0].organizationApproved === true);
            } else {
              setIsOrgApproved(false);
            }
          } catch (error) {
            console.error("Error checking organization approval:", error);
            setIsOrgApproved(false);
          }
        }
      } catch (error) {
        console.error("Error checking admin status:", error);
        
        // Special case for pdarleyjr@gmail.com - always super admin
        if (session.user.email === 'pdarleyjr@gmail.com') {
          console.log("Setting pdarleyjr@gmail.com as super admin (in catch block)");
          setIsAdmin(true);
          setIsSuperAdmin(true);
          setIsOrgAdmin(false);
          setOrganizationId(1); // Set a default organization ID
          setIsOrgApproved(true);
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminStatus();
  }, [session?.user?.id, session?.user?.email]);

  return { isAdmin, isSuperAdmin, isOrgAdmin, organizationId, isOrgApproved, isLoading };
}