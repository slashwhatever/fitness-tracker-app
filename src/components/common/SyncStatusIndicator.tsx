"use client";

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSyncStatus } from '@/hooks/useSyncStatus';
import {
    AlertCircle,
    CheckCircle,
    Clock,
    Loader2,
    RefreshCw,
    Wifi,
    WifiOff
} from 'lucide-react';

interface SyncStatusIndicatorProps {
  variant?: 'compact' | 'detailed';
  showActions?: boolean;
}

export function SyncStatusIndicator({ 
  variant = 'compact', 
  showActions = false 
}: SyncStatusIndicatorProps) {
  const [status, actions] = useSyncStatus();

  const formatLastSync = (lastSyncTime: string | null) => {
    if (!lastSyncTime) return 'Never';
    
    const date = new Date(lastSyncTime);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    return date.toLocaleDateString();
  };

  const getStatusColor = () => {
    if (!status.isOnline) return 'text-red-500';
    if (status.hasErrors) return 'text-yellow-500';
    if (status.pendingOperations > 0) return 'text-blue-500';
    return 'text-green-500';
  };

  const getStatusIcon = () => {
    if (status.isLoading) return <Loader2 className="h-4 w-4 animate-spin" />;
    if (!status.isOnline) return <WifiOff className="h-4 w-4" />;
    if (status.hasErrors) return <AlertCircle className="h-4 w-4" />;
    if (status.pendingOperations > 0) return <Clock className="h-4 w-4" />;
    return <CheckCircle className="h-4 w-4" />;
  };

  const getStatusText = () => {
    if (!status.isOnline) return 'Offline';
    if (status.hasErrors) return `${status.errorCount} sync errors`;
    if (status.pendingOperations > 0) return `${status.pendingOperations} pending`;
    return 'Synced';
  };

  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-2">
        <div className={`flex items-center gap-1 ${getStatusColor()}`}>
          {getStatusIcon()}
          <span className="text-sm font-medium">{getStatusText()}</span>
        </div>
        
        {status.isOnline && (
          <Badge variant="outline" className="text-xs">
            {status.isOnline ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
          </Badge>
        )}
      </div>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          {getStatusIcon()}
          Sync Status
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-muted-foreground">Connection</div>
            <div className={`flex items-center gap-1 font-medium ${getStatusColor()}`}>
              {status.isOnline ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
              {status.isOnline ? 'Online' : 'Offline'}
            </div>
          </div>
          
          <div>
            <div className="text-muted-foreground">Pending</div>
            <div className="font-medium">
              {status.pendingOperations} operations
            </div>
          </div>
          
          <div>
            <div className="text-muted-foreground">Errors</div>
            <div className={`font-medium ${status.hasErrors ? 'text-red-500' : ''}`}>
              {status.errorCount} errors
            </div>
          </div>
          
          <div>
            <div className="text-muted-foreground">Last Sync</div>
            <div className="font-medium">
              {formatLastSync(status.lastSyncTime)}
            </div>
          </div>
        </div>

        {showActions && (
          <div className="flex gap-2 pt-2 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={actions.triggerSync}
              disabled={!status.isOnline || status.isLoading}
              className="flex-1"
            >
              {status.isLoading ? (
                <Loader2 className="h-3 w-3 animate-spin mr-1" />
              ) : (
                <RefreshCw className="h-3 w-3 mr-1" />
              )}
              Sync Now
            </Button>
            
            {status.hasErrors && (
              <Button
                variant="outline"
                size="sm"
                onClick={actions.retryFailedOperations}
                disabled={status.isLoading}
                className="flex-1"
              >
                Retry Errors
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
