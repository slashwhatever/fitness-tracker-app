import { useAuth } from "@/lib/auth/AuthProvider";
import { SupabaseService } from "@/services/supabaseService";
import { useEffect, useState } from "react";

interface SyncStatus {
  isOnline: boolean;
  supabaseConnected: boolean;
  lastSyncTime: string | null;
  pendingOperations: number;
}

export function useSyncStatus() {
  const { user } = useAuth();
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isOnline: typeof navigator !== "undefined" ? navigator.onLine : false,
    supabaseConnected: false,
    lastSyncTime: null,
    pendingOperations: 0,
  });

  const refreshStatus = async () => {
    const isOnline =
      typeof navigator !== "undefined" ? navigator.onLine : false;

    // Test Supabase connection
    let supabaseConnected = false;
    try {
      if (user?.id) {
        await SupabaseService.getUserProfile(user.id);
        supabaseConnected = true;
      }
    } catch (error) {
      console.error("Supabase connection test failed:", error);
      supabaseConnected = false;
    }

    setSyncStatus({
      isOnline,
      supabaseConnected,
      lastSyncTime: new Date().toISOString(),
      pendingOperations: 0, // No pending operations in direct Supabase mode
    });
  };

  useEffect(() => {
    refreshStatus();

    // Listen for online/offline events
    const handleOnline = () => refreshStatus();
    const handleOffline = () => refreshStatus();

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Periodic status refresh
    const interval = setInterval(refreshStatus, 30000);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      clearInterval(interval);
    };
  }, [user?.id]);

  const triggerManualSync = async () => {
    // In direct Supabase mode, manual sync just tests the connection
    await refreshStatus();
    return {
      success: syncStatus.supabaseConnected,
      message: syncStatus.supabaseConnected
        ? "Connected to Supabase"
        : "Connection failed",
    };
  };

  const clearFailedOperations = async () => {
    // No failed operations in direct Supabase mode
    await refreshStatus();
  };

  const retryFailedOperations = async () => {
    // No failed operations to retry in direct Supabase mode
    await refreshStatus();
  };

  return {
    syncStatus,
    refreshStatus,
    triggerManualSync,
    clearFailedOperations,
    retryFailedOperations,
  };
}
