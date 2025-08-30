import { HybridStorageManager } from "@/lib/storage/HybridStorageManager";
import { useCallback, useEffect, useState } from "react";

interface SyncStatus {
  pendingOperations: number;
  lastSyncTime: string | null;
  isOnline: boolean;
  hasErrors: boolean;
  errorCount: number;
  isLoading: boolean;
}

interface SyncActions {
  triggerSync: () => Promise<void>;
  retryFailedOperations: () => Promise<void>;
  clearFailedOperations: () => Promise<void>;
  refreshStatus: () => Promise<void>;
}

export function useSyncStatus(): [SyncStatus, SyncActions] {
  const [status, setStatus] = useState<SyncStatus>({
    pendingOperations: 0,
    lastSyncTime: null,
    isOnline: navigator.onLine,
    hasErrors: false,
    errorCount: 0,
    isLoading: true,
  });

  const refreshStatus = useCallback(async () => {
    try {
      const syncStatus = await HybridStorageManager.getSyncStatus();
      setStatus(() => ({
        ...syncStatus,
        isLoading: false,
      }));
    } catch (error) {
      console.error("Failed to refresh sync status:", error);
      setStatus((prev) => ({
        ...prev,
        isLoading: false,
      }));
    }
  }, []);

  const triggerSync = useCallback(async () => {
    setStatus((prev) => ({ ...prev, isLoading: true }));
    try {
      const result = await HybridStorageManager.triggerManualSync();
      console.log("Manual sync result:", result);
      await refreshStatus();
    } catch (error) {
      console.error("Manual sync failed:", error);
      setStatus((prev) => ({ ...prev, isLoading: false }));
    }
  }, [refreshStatus]);

  const retryFailedOperations = useCallback(async () => {
    setStatus((prev) => ({ ...prev, isLoading: true }));
    try {
      const result = await HybridStorageManager.retryFailedOperations();
      console.log("Retry failed operations result:", result);
      await refreshStatus();
    } catch (error) {
      console.error("Retry failed operations failed:", error);
      setStatus((prev) => ({ ...prev, isLoading: false }));
    }
  }, [refreshStatus]);

  const clearFailedOperations = useCallback(async () => {
    setStatus((prev) => ({ ...prev, isLoading: true }));
    try {
      await HybridStorageManager.clearFailedOperations();
      await refreshStatus();
    } catch (error) {
      console.error("Clear failed operations failed:", error);
      setStatus((prev) => ({ ...prev, isLoading: false }));
    }
  }, [refreshStatus]);

  // Listen for online/offline events
  useEffect(() => {
    const handleOnline = () => {
      setStatus((prev) => ({ ...prev, isOnline: true }));
      // Trigger automatic sync when coming back online
      HybridStorageManager.processBackgroundSync().then(() => {
        refreshStatus();
      });
    };

    const handleOffline = () => {
      setStatus((prev) => ({ ...prev, isOnline: false }));
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Initial status load
    refreshStatus();

    // Set up periodic status refresh (every 30 seconds)
    const interval = setInterval(refreshStatus, 30000);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      clearInterval(interval);
    };
  }, [refreshStatus]);

  const actions: SyncActions = {
    triggerSync,
    retryFailedOperations,
    clearFailedOperations,
    refreshStatus,
  };

  return [status, actions];
}
