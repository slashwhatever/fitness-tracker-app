'use client';

import { SyncStatusIndicator } from '@/components/common/SyncStatusIndicator';
import { useSyncStatus } from '@/hooks/useSyncStatus';
import { createContext, useContext } from 'react';

interface SyncStatusContextType {
  status: {
    pendingOperations: number;
    lastSyncTime: string | null;
    isOnline: boolean;
    hasErrors: boolean;
    errorCount: number;
    isLoading: boolean;
  };
  actions: {
    triggerSync: () => Promise<void>;
    retryFailedOperations: () => Promise<void>;
    clearFailedOperations: () => Promise<void>;
    refreshStatus: () => Promise<void>;
  };
}

const SyncStatusContext = createContext<SyncStatusContextType | null>(null);

interface SyncStatusProviderProps {
  children: React.ReactNode;
  showIndicator?: boolean;
  indicatorVariant?: 'compact' | 'detailed';
  indicatorPosition?: 'top-right' | 'bottom-right' | 'inline';
}

export function SyncStatusProvider({ 
  children, 
  showIndicator = true,
  indicatorVariant = 'compact',
  indicatorPosition = 'top-right'
}: SyncStatusProviderProps) {
  const [status, actions] = useSyncStatus();

  const contextValue: SyncStatusContextType = {
    status,
    actions
  };

  const getIndicatorPositionClasses = () => {
    switch (indicatorPosition) {
      case 'top-right':
        return 'fixed top-4 right-4 z-50';
      case 'bottom-right':
        return 'fixed bottom-4 right-4 z-50';
      case 'inline':
        return '';
      default:
        return 'fixed top-4 right-4 z-50';
    }
  };

  return (
    <SyncStatusContext.Provider value={contextValue}>
      {children}
      
      {showIndicator && (
        <div className={getIndicatorPositionClasses()}>
          <SyncStatusIndicator 
            variant={indicatorVariant}
            showActions={indicatorVariant === 'detailed'}
          />
        </div>
      )}
    </SyncStatusContext.Provider>
  );
}

export function useSyncStatusContext() {
  const context = useContext(SyncStatusContext);
  if (!context) {
    throw new Error('useSyncStatusContext must be used within a SyncStatusProvider');
  }
  return context;
}

// Convenience hook for components that just need sync status
export function useAppSyncStatus() {
  const context = useContext(SyncStatusContext);
  return context?.status || {
    pendingOperations: 0,
    lastSyncTime: null,
    isOnline: navigator.onLine,
    hasErrors: false,
    errorCount: 0,
    isLoading: false,
  };
}
