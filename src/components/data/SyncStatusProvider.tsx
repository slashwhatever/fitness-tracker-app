// Temporarily disabled during refactor
export default function SyncStatusProvider({ children }: { children: React.ReactNode }) { 
  return <>{children}</>; 
}
export function useSyncContext() {
  return { 
    syncStatus: { isOnline: true, lastSync: null }, 
    refreshStatus: () => {}, 
    triggerManualSync: () => Promise.resolve({ success: true, message: "mock" }), 
    clearFailedOperations: () => {}, 
    retryFailedOperations: () => {}
  }; 
}
