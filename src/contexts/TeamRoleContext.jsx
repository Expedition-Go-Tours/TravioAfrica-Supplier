import { createContext, useState, useEffect, useCallback } from "react";
import api from "@/lib/axios";
import { useAuthStore } from "@/stores/authStore";

export const TeamRoleContext = createContext(null);

export function TeamRoleProvider({ children }) {
  const [teamRole, setTeamRole] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(true);
  const [fetchKey, setFetchKey] = useState(0);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const refetch = useCallback(() => setFetchKey((k) => k + 1), []);

  useEffect(() => {
    if (!isAuthenticated) {
      setTeamRole(null);
      setPermissions([]);
      setIsOwner(false);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    const fetchTeamRole = async () => {
      try {
        const response = await api.get("/suppliers/settings/team/my-role", {
          skipGlobalErrorHandler: true,
        });
        if (cancelled) return;
        const data = response.data?.data;
        setTeamRole(data?.role || null);
        setPermissions(data?.permissions || []);
        setIsOwner(data?.isOwner || false);
      } catch {
        if (cancelled) return;
        setTeamRole(null);
        setPermissions([]);
        setIsOwner(false);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchTeamRole();
    return () => { cancelled = true; };
  }, [isAuthenticated, fetchKey]);

  const hasPermission = (permission) => {
    if (isOwner) return true;
    if (permissions.includes("*")) return true;
    if (permissions.includes(permission)) return true;
    const prefix = permission.split(".")[0];
    return permissions.some((p) => p.endsWith("*") && p.startsWith(prefix));
  };

  const canManageTeam = () => teamRole === "admin" || isOwner;
  const canManageTours = () => hasPermission("tours.view");
  const canManageFinance = () => hasPermission("earnings.view");
  const canManageChat = () => hasPermission("chat.view");

  return (
    <TeamRoleContext.Provider
      value={{
        teamRole,
        permissions,
        isOwner,
        loading,
        refetch,
        hasPermission,
        canManageTeam,
        canManageTours,
        canManageFinance,
        canManageChat,
      }}
    >
      {children}
    </TeamRoleContext.Provider>
  );
}
