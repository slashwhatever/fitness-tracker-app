import { supabaseClient, type Database } from "@/lib/supabase/client";
import type { SyncOperation, WorkoutSession } from "@/models/types";

// Define valid table names from the Database schema
type TableName = keyof Database["public"]["Tables"];

// ============================================================================
// HYBRID STORAGE MANAGER
// ============================================================================

export class HybridStorageManager {
  private static readonly STORAGE_PREFIX = "fitness_app_";
  private static readonly SYNC_QUEUE_KEY = "sync_queue";
  private static readonly CACHE_TTL = 10 * 60 * 1000; // 10 minutes

  // ============================================================================
  // CORE STORAGE OPERATIONS
  // ============================================================================

  static async saveRecord<T extends { id: string }>(
    tableName: string,
    record: T
  ): Promise<T> {
    // Save locally first for immediate UI response
    await this.setLocalRecord(tableName, record.id, record);

    // Try to sync to Supabase if online
    if (navigator.onLine) {
      try {
        // TODO: Implement proper Supabase table-specific inserts
        // For now, just queue for sync to avoid TypeScript issues
        await this.queueForSync("INSERT", tableName, record);
        return record;
      } catch (error) {
        // Queue for sync if server operation fails
        await this.queueForSync("INSERT", tableName, record);
        console.warn(
          `Failed to sync ${tableName} to server, queued for later:`,
          error
        );
      }
    } else {
      // Queue for sync when offline
      await this.queueForSync("INSERT", tableName, record);
    }

    return record;
  }

  static async updateRecord<T extends { id: string }>(
    tableName: string,
    id: string,
    updates: Partial<T>
  ): Promise<T | null> {
    // Update locally first
    const existingRecord = await this.getLocalRecord<T>(tableName, id);
    if (!existingRecord) return null;

    const updatedRecord = { ...existingRecord, ...updates };
    await this.setLocalRecord(tableName, id, updatedRecord);

    // Try to sync to Supabase if online
    if (navigator.onLine) {
      try {
        // TODO: Implement proper Supabase table-specific updates
        // For now, just queue for sync to avoid TypeScript issues
        await this.queueForSync("UPDATE", tableName, { id, ...updates });
        return updatedRecord;
      } catch (error) {
        // Queue for sync if server operation fails
        await this.queueForSync("UPDATE", tableName, { id, ...updates });
        console.warn(
          `Failed to sync ${tableName} update to server, queued for later:`,
          error
        );
      }
    } else {
      // Queue for sync when offline
      await this.queueForSync("UPDATE", tableName, { id, ...updates });
    }

    return updatedRecord;
  }

  static async deleteRecord(
    tableName: TableName,
    id: string
  ): Promise<boolean> {
    // Remove locally first
    await this.removeLocalRecord(tableName, id);

    // Try to sync to Supabase if online
    if (navigator.onLine && supabaseClient) {
      try {
        const { error } = await supabaseClient
          .from(tableName)
          .delete()
          .eq("id", id);

        if (error) throw error;
        return true;
      } catch (error) {
        // Queue for sync if server operation fails
        await this.queueForSync("DELETE", tableName, { id });
        console.warn(
          `Failed to sync ${tableName} deletion to server, queued for later:`,
          error
        );
      }
    } else {
      // Queue for sync when offline
      await this.queueForSync("DELETE", tableName, { id });
    }

    return true;
  }

  // ============================================================================
  // LOCAL STORAGE OPERATIONS
  // ============================================================================

  static async getLocalRecord<T>(
    tableName: string,
    id: string
  ): Promise<T | null> {
    try {
      const key = `${this.STORAGE_PREFIX}${tableName}_${id}`;
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error("Error reading from localStorage:", error);
      return null;
    }
  }

  static async setLocalRecord<T>(
    tableName: string,
    id: string,
    record: T
  ): Promise<void> {
    try {
      const key = `${this.STORAGE_PREFIX}${tableName}_${id}`;
      localStorage.setItem(key, JSON.stringify(record));
    } catch (error) {
      console.error("Error writing to localStorage:", error);
      // Handle quota exceeded
      if (error instanceof DOMException && error.code === 22) {
        await this.cleanupOldRecords();
        // Retry once after cleanup
        try {
          const key = `${this.STORAGE_PREFIX}${tableName}_${id}`;
          localStorage.setItem(key, JSON.stringify(record));
        } catch (retryError) {
          console.error("Failed to save after cleanup:", retryError);
        }
      }
    }
  }

  static async removeLocalRecord(tableName: string, id: string): Promise<void> {
    try {
      const key = `${this.STORAGE_PREFIX}${tableName}_${id}`;
      localStorage.removeItem(key);
    } catch (error) {
      console.error("Error removing from localStorage:", error);
    }
  }

  static async getLocalRecords<T>(
    tableName: string,
    filters?: Record<string, unknown>
  ): Promise<T[]> {
    try {
      const prefix = `${this.STORAGE_PREFIX}${tableName}_`;
      const records: T[] = [];

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(prefix)) {
          const data = localStorage.getItem(key);
          if (data) {
            const record = JSON.parse(data);

            // Apply filters if provided
            if (filters) {
              const matches = Object.entries(filters).every(
                ([field, value]) => record[field] === value
              );
              if (matches) records.push(record);
            } else {
              records.push(record);
            }
          }
        }
      }

      return records;
    } catch (error) {
      console.error("Error reading records from localStorage:", error);
      return [];
    }
  }

  // ============================================================================
  // SYNC QUEUE OPERATIONS
  // ============================================================================

  static async queueForSync(
    operation: "INSERT" | "UPDATE" | "DELETE",
    tableName: string,
    data: Record<string, unknown> & { id: string }
  ): Promise<void> {
    try {
      const syncOp: SyncOperation = {
        id: `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        operation,
        table_name: tableName,
        record_id: data.id,
        data,
        timestamp: new Date().toISOString(),
        retry_count: 0,
        created_at: new Date().toISOString(),
      };

      const queue = await this.getSyncQueue();
      queue.push(syncOp);
      localStorage.setItem(
        `${this.STORAGE_PREFIX}${this.SYNC_QUEUE_KEY}`,
        JSON.stringify(queue)
      );
    } catch (error) {
      console.error("Error queuing sync operation:", error);
    }
  }

  static async getSyncQueue(): Promise<SyncOperation[]> {
    try {
      const data = localStorage.getItem(
        `${this.STORAGE_PREFIX}${this.SYNC_QUEUE_KEY}`
      );
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("Error reading sync queue:", error);
      return [];
    }
  }

  static async getSyncQueueSize(): Promise<number> {
    const queue = await this.getSyncQueue();
    return queue.length;
  }

  static async processBackgroundSync(): Promise<void> {
    if (!navigator.onLine) return;

    const queue = await this.getSyncQueue();
    const processedOps: string[] = [];

    for (const op of queue) {
      try {
        let success = false;

        switch (op.operation) {
          case "INSERT":
            success = await this.syncInsertOperation(op);
            break;

          case "UPDATE":
            success = await this.syncUpdateOperation(op);
            break;

          case "DELETE":
            success = await this.syncDeleteOperation(op);
            break;
        }

        if (success) {
          processedOps.push(op.id);
        } else {
          // Handle retry logic with exponential backoff
          op.retry_count = (op.retry_count || 0) + 1;
          op.error = `Sync failed (attempt ${op.retry_count})`;

          // Remove operations that have exceeded max retries (5 attempts)
          if (op.retry_count >= 5) {
            console.error(
              `Max retries exceeded for operation ${op.id}, removing from queue`
            );
            processedOps.push(op.id);
          }
        }
      } catch (error) {
        console.error(`Failed to sync operation ${op.id}:`, error);
        // Mark operation with error and increment retry count
        op.retry_count = (op.retry_count || 0) + 1;
        op.error = error instanceof Error ? error.message : "Unknown error";

        // Remove operations that have exceeded max retries
        if (op.retry_count >= 5) {
          console.error(
            `Max retries exceeded for operation ${op.id}, removing from queue`
          );
          processedOps.push(op.id);
        }
      }
    }

    // Update queue with retry counts and remove processed operations
    const updatedQueue = queue.filter((op) => !processedOps.includes(op.id));
    localStorage.setItem(
      `${this.STORAGE_PREFIX}${this.SYNC_QUEUE_KEY}`,
      JSON.stringify(updatedQueue)
    );
  }

  // ============================================================================
  // SYNC OPERATION HANDLERS
  // ============================================================================

  private static async syncInsertOperation(
    op: SyncOperation
  ): Promise<boolean> {
    if (!supabaseClient) {
      console.warn("Supabase client not available for sync operation");
      return false;
    }

    try {
      // Use dynamic table access with proper type casting
      const { error } = await (
        supabaseClient as unknown as {
          from: (table: string) => {
            insert: (
              data: Record<string, unknown>
            ) => Promise<{ error: unknown }>;
          };
        }
      )
        .from(op.table_name)
        .insert(op.data);

      if (error) {
        console.error(`Insert sync failed for ${op.table_name}:`, error);
        return false;
      }

      return true;
    } catch (error) {
      console.error(`Insert sync error for ${op.table_name}:`, error);
      return false;
    }
  }

  private static async syncUpdateOperation(
    op: SyncOperation
  ): Promise<boolean> {
    if (!supabaseClient) {
      console.warn("Supabase client not available for sync operation");
      return false;
    }

    try {
      // Check for conflicts by comparing timestamps
      const { data: serverData, error: fetchError } = await (
        supabaseClient as unknown as {
          from: (table: string) => {
            select: (columns: string) => {
              eq: (
                column: string,
                value: string
              ) => {
                single: () => Promise<{
                  data: { updated_at?: string } | null;
                  error: { code?: string } | null;
                }>;
              };
            };
          };
        }
      )
        .from(op.table_name)
        .select("updated_at")
        .eq("id", op.record_id)
        .single();

      if (fetchError && fetchError.code !== "PGRST116") {
        // PGRST116 = not found
        console.error(
          `Conflict check failed for ${op.table_name}:`,
          fetchError
        );
        return false;
      }

      // Handle conflict resolution
      if (serverData && serverData.updated_at) {
        const serverTime = new Date(serverData.updated_at).getTime();
        const localTime = new Date(op.timestamp).getTime();

        // If server data is newer, fetch and update local data
        if (serverTime > localTime) {
          await this.resolveUpdateConflict(op.table_name, op.record_id);
          return true; // Mark as resolved
        }
      }

      // Proceed with update if no conflict or local data is newer
      const { error } = await (
        supabaseClient as unknown as {
          from: (table: string) => {
            update: (data: Record<string, unknown>) => {
              eq: (
                column: string,
                value: string
              ) => Promise<{ error: unknown }>;
            };
          };
        }
      )
        .from(op.table_name)
        .update(op.data)
        .eq("id", op.record_id);

      if (error) {
        console.error(`Update sync failed for ${op.table_name}:`, error);
        return false;
      }

      return true;
    } catch (error) {
      console.error(`Update sync error for ${op.table_name}:`, error);
      return false;
    }
  }

  private static async syncDeleteOperation(
    op: SyncOperation
  ): Promise<boolean> {
    if (!supabaseClient) {
      console.warn("Supabase client not available for sync operation");
      return false;
    }

    try {
      const { error } = await (
        supabaseClient as unknown as {
          from: (table: string) => {
            delete: () => {
              eq: (
                column: string,
                value: string
              ) => Promise<{ error: unknown }>;
            };
          };
        }
      )
        .from(op.table_name)
        .delete()
        .eq("id", op.record_id);

      if (error) {
        console.error(`Delete sync failed for ${op.table_name}:`, error);
        return false;
      }

      return true;
    } catch (error) {
      console.error(`Delete sync error for ${op.table_name}:`, error);
      return false;
    }
  }

  private static async resolveUpdateConflict(
    tableName: string,
    recordId: string
  ): Promise<void> {
    if (!supabaseClient) {
      console.warn("Supabase client not available for conflict resolution");
      return;
    }

    try {
      // Fetch the latest server data
      const { data: serverData, error } = await (
        supabaseClient as unknown as {
          from: (table: string) => {
            select: (columns: string) => {
              eq: (
                column: string,
                value: string
              ) => {
                single: () => Promise<{
                  data: Record<string, unknown> | null;
                  error: unknown;
                }>;
              };
            };
          };
        }
      )
        .from(tableName)
        .select("*")
        .eq("id", recordId)
        .single();

      if (error) {
        console.error(
          `Failed to fetch server data for conflict resolution:`,
          error
        );
        return;
      }

      // Update local storage with server data
      await this.setLocalRecord(tableName, recordId, serverData);

      // Notify about conflict resolution (could be enhanced with user notification)
      console.info(
        `Conflict resolved for ${tableName}:${recordId} - server data took precedence`
      );
    } catch (error) {
      console.error(`Conflict resolution failed:`, error);
    }
  }

  // ============================================================================
  // CACHING OPERATIONS
  // ============================================================================

  static async setCachedData<T>(
    key: string,
    data: T,
    ttl = this.CACHE_TTL
  ): Promise<void> {
    try {
      const cacheItem = {
        data,
        expires: Date.now() + ttl,
      };
      const cacheKey = `${this.STORAGE_PREFIX}cache_${key}`;
      localStorage.setItem(cacheKey, JSON.stringify(cacheItem));
    } catch (error) {
      console.error("Error setting cache:", error);
    }
  }

  static async getCachedData<T>(key: string): Promise<T | null> {
    try {
      const cacheKey = `${this.STORAGE_PREFIX}cache_${key}`;
      const data = localStorage.getItem(cacheKey);

      if (!data) return null;

      const cacheItem = JSON.parse(data);

      if (cacheItem.expires < Date.now()) {
        // Cache expired, remove it
        localStorage.removeItem(cacheKey);
        return null;
      }

      return cacheItem.data;
    } catch (error) {
      console.error("Error reading cache:", error);
      return null;
    }
  }

  // ============================================================================
  // SPECIALIZED METHODS
  // ============================================================================

  static async getUserProfile(
    user_id: string
  ): Promise<Database["public"]["Tables"]["user_profiles"]["Row"] | null> {
    // Try local first
    let profile = await this.getLocalRecord<
      Database["public"]["Tables"]["user_profiles"]["Row"]
    >("user_profiles", user_id);

    if (!profile && navigator.onLine && supabaseClient) {
      // Fetch from server if not in local storage
      try {
        const { data, error } = await supabaseClient
          .from("user_profiles")
          .select("*")
          .eq("id", user_id)
          .single();

        if (!error && data) {
          profile =
            data as Database["public"]["Tables"]["user_profiles"]["Row"];
          await this.setLocalRecord("user_profiles", user_id, profile);
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    }

    return profile;
  }

  static async getActiveWorkoutSession(): Promise<WorkoutSession | null> {
    const sessions = await this.getLocalRecords<WorkoutSession>(
      "workout_sessions"
    );
    return sessions.find((session) => !session.completed_at) || null;
  }

  static async getWorkoutMovements(
    workoutId: string
  ): Promise<Record<string, unknown>[]> {
    // This would typically join workout_movements with user_movements
    // For now, return from local storage
    const workoutMovements = await this.getLocalRecords<
      Record<string, unknown>
    >("workout_movements", {
      workout_id: workoutId,
    });
    return workoutMovements;
  }

  static async clearUserData(): Promise<void> {
    try {
      // Clear all app-related data from localStorage
      const keysToRemove: string[] = [];

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(this.STORAGE_PREFIX)) {
          keysToRemove.push(key);
        }
      }

      keysToRemove.forEach((key) => localStorage.removeItem(key));
    } catch (error) {
      console.error("Error clearing user data:", error);
    }
  }

  // ============================================================================
  // MAINTENANCE OPERATIONS
  // ============================================================================

  static async cleanupOldRecords(): Promise<void> {
    try {
      const cutoffTime = Date.now() - 7 * 24 * 60 * 60 * 1000; // 7 days ago
      const keysToRemove: string[] = [];

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(this.STORAGE_PREFIX)) {
          const data = localStorage.getItem(key);
          if (data) {
            try {
              const record = JSON.parse(data);
              const recordTime = new Date(
                record.created_at || record.updated_at
              ).getTime();

              if (recordTime < cutoffTime) {
                keysToRemove.push(key);
              }
            } catch {
              // If we can't parse it, remove it
              keysToRemove.push(key);
            }
          }
        }
      }

      keysToRemove.forEach((key) => localStorage.removeItem(key));
      console.log(`Cleaned up ${keysToRemove.length} old records`);
    } catch (error) {
      console.error("Error during cleanup:", error);
    }
  }

  static getStorageUsage(): {
    used: number;
    total: number;
    percentage: number;
  } {
    let used = 0;

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(this.STORAGE_PREFIX)) {
        used += (localStorage.getItem(key) || "").length;
      }
    }

    // Estimate total localStorage capacity (usually 5-10MB)
    const total = 5 * 1024 * 1024; // 5MB estimate
    const percentage = (used / total) * 100;

    return { used, total, percentage };
  }

  // ============================================================================
  // SYNC STATUS AND USER FEEDBACK
  // ============================================================================

  static async getSyncStatus(): Promise<{
    pendingOperations: number;
    lastSyncTime: string | null;
    isOnline: boolean;
    hasErrors: boolean;
    errorCount: number;
  }> {
    const queue = await this.getSyncQueue();
    const errorOperations = queue.filter((op) => op.error);
    const lastSyncKey = `${this.STORAGE_PREFIX}last_sync_time`;
    const lastSyncTime = localStorage.getItem(lastSyncKey);

    return {
      pendingOperations: queue.length,
      lastSyncTime,
      isOnline: navigator.onLine,
      hasErrors: errorOperations.length > 0,
      errorCount: errorOperations.length,
    };
  }

  static async triggerManualSync(): Promise<{
    success: boolean;
    message: string;
    syncedOperations: number;
  }> {
    if (!navigator.onLine) {
      return {
        success: false,
        message: "Cannot sync while offline",
        syncedOperations: 0,
      };
    }

    const initialQueue = await this.getSyncQueue();
    const initialCount = initialQueue.length;

    if (initialCount === 0) {
      return {
        success: true,
        message: "No pending operations to sync",
        syncedOperations: 0,
      };
    }

    try {
      await this.processBackgroundSync();
      const finalQueue = await this.getSyncQueue();
      const syncedCount = initialCount - finalQueue.length;

      // Update last sync time
      const lastSyncKey = `${this.STORAGE_PREFIX}last_sync_time`;
      localStorage.setItem(lastSyncKey, new Date().toISOString());

      return {
        success: true,
        message: `Synced ${syncedCount} operations successfully`,
        syncedOperations: syncedCount,
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Sync failed",
        syncedOperations: 0,
      };
    }
  }

  static async getFailedOperations(): Promise<SyncOperation[]> {
    const queue = await this.getSyncQueue();
    return queue.filter((op) => op.error);
  }

  static async clearFailedOperations(): Promise<void> {
    const queue = await this.getSyncQueue();
    const successfulOps = queue.filter((op) => !op.error);
    localStorage.setItem(
      `${this.STORAGE_PREFIX}${this.SYNC_QUEUE_KEY}`,
      JSON.stringify(successfulOps)
    );
  }

  static async retryFailedOperations(): Promise<{
    success: boolean;
    message: string;
    retriedCount: number;
  }> {
    const failedOps = await this.getFailedOperations();

    if (failedOps.length === 0) {
      return {
        success: true,
        message: "No failed operations to retry",
        retriedCount: 0,
      };
    }

    // Reset retry counts for failed operations
    failedOps.forEach((op) => {
      op.retry_count = 0;
      op.error = undefined;
    });

    // Update the queue
    const queue = await this.getSyncQueue();
    localStorage.setItem(
      `${this.STORAGE_PREFIX}${this.SYNC_QUEUE_KEY}`,
      JSON.stringify(queue)
    );

    // Trigger sync
    const result = await this.triggerManualSync();

    return {
      success: result.success,
      message: `Retried ${failedOps.length} operations: ${result.message}`,
      retriedCount: failedOps.length,
    };
  }
}
