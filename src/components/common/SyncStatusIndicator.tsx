'use client';

import { useSyncContext } from '@/components/data/SyncStatusProvider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    AlertCircle,
    CheckCircle,
    RefreshCw,
    Wifi,
    WifiOff,
} from 'lucide-react';

export default function SyncStatusIndicator() {
  const { syncStatus, refreshStatus, triggerManualSync } = useSyncContext();

  const getStatusIcon = () => {
    if (!syncStatus.isOnline) {
      return <WifiOff className="w-4 h-4 text-red-500" />;
    }
    if (!syncStatus.supabaseConnected) {
      return <AlertCircle className="w-4 h-4 text-orange-500" />;
    }
    return <CheckCircle className="w-4 h-4 text-green-500" />;
  };

  const getStatusText = () => {
    if (!syncStatus.isOnline) {
      return 'Offline';
    }
    if (!syncStatus.supabaseConnected) {
      return 'Connection Issues';
    }
    return 'Connected';
  };

  const getStatusVariant = (): "default" | "secondary" | "destructive" | "outline" => {
    if (!syncStatus.isOnline) return 'destructive';
    if (!syncStatus.supabaseConnected) return 'outline';
    return 'default';
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <span className="text-lg">Connection Status</span>
          <Badge variant={getStatusVariant()} className="flex items-center space-x-1">
            {getStatusIcon()}
            <span>{getStatusText()}</span>
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            {syncStatus.isOnline ? (
              <Wifi className="w-4 h-4 text-green-500" />
            ) : (
              <WifiOff className="w-4 h-4 text-red-500" />
            )}
            <span className="text-muted-foreground">
              {syncStatus.isOnline ? 'Online' : 'Offline'}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            {syncStatus.supabaseConnected ? (
              <CheckCircle className="w-4 h-4 text-green-500" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-500" />
            )}
            <span className="text-muted-foreground">
              {syncStatus.supabaseConnected ? 'Supabase OK' : 'Supabase Error'}
            </span>
          </div>
        </div>

        {syncStatus.lastSyncTime && (
          <p className="text-xs text-muted-foreground">
            Last checked: {new Date(syncStatus.lastSyncTime).toLocaleTimeString()}
          </p>
        )}

        <div className="flex space-x-2">
          <Button 
            size="sm" 
            variant="outline" 
            onClick={refreshStatus}
            className="flex items-center space-x-1"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Refresh</span>
          </Button>
          
          <Button 
            size="sm" 
            variant="outline" 
            onClick={triggerManualSync}
            className="flex items-center space-x-1"
          >
            <CheckCircle className="w-3 h-3" />
            <span>Test Connection</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
