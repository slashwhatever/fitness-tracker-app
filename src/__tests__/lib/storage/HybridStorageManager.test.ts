import { HybridStorageManager } from "@/lib/storage/HybridStorageManager";

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

// Mock Supabase client
jest.mock("@/lib/supabase/client", () => ({
  supabaseClient: {
    from: jest.fn(() => ({
      insert: jest.fn(() => ({ error: null })),
      update: jest.fn(() => ({ error: null })),
      delete: jest.fn(() => ({ error: null })),
      select: jest.fn(() => ({ data: [], error: null })),
    })),
  },
}));

// Replace global localStorage
Object.defineProperty(global, "localStorage", {
  value: mockLocalStorage,
  writable: true,
});

// Mock navigator.onLine
const mockNavigator = {
  onLine: true,
};
Object.defineProperty(global, "navigator", {
  value: mockNavigator,
  writable: true,
});

describe("HybridStorageManager", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigator.onLine = true;
  });

  describe("Local Storage Operations", () => {
    it("should save record to localStorage with correct key format", async () => {
      const testData = {
        id: "test-id",
        name: "Test Workout",
        user_id: "user-123",
      };

      mockLocalStorage.setItem.mockImplementation(() => {});

      const result = await HybridStorageManager.saveRecord(
        "workouts",
        testData
      );

      expect(result).toEqual(testData);
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        "fitness_app_workouts_test-id",
        JSON.stringify(testData)
      );
    });

    it("should retrieve record from localStorage", async () => {
      const testData = {
        id: "test-id",
        name: "Test Workout",
        user_id: "user-123",
      };

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(testData));

      const result = await HybridStorageManager.getLocalRecord(
        "workouts",
        "test-id"
      );

      expect(result).toEqual(testData);
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith(
        "fitness_app_workouts_test-id"
      );
    });

    it("should return null for non-existent record", async () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      const result = await HybridStorageManager.getLocalRecord(
        "workouts",
        "non-existent"
      );

      expect(result).toBeNull();
    });

    it("should handle JSON parse errors gracefully", async () => {
      mockLocalStorage.getItem.mockReturnValue("invalid-json");

      const result = await HybridStorageManager.getLocalRecord(
        "workouts",
        "test-id"
      );

      expect(result).toBeNull();
    });

    it("should delete record from localStorage", async () => {
      mockLocalStorage.removeItem.mockImplementation(() => {});

      const result = await HybridStorageManager.deleteRecord(
        "workouts",
        "test-id"
      );

      expect(result).toBe(true);
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(
        "fitness_app_workouts_test-id"
      );
    });
  });

  describe("Sync Queue Management", () => {
    it("should queue operations for sync", async () => {
      const testData = { id: "test-id", name: "Test" };

      mockLocalStorage.getItem.mockReturnValue("[]");
      mockLocalStorage.setItem.mockImplementation(() => {});

      await HybridStorageManager.queueForSync("INSERT", "workouts", testData);

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        "fitness_app_sync_queue",
        expect.stringContaining('"table_name":"workouts"')
      );
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        "fitness_app_sync_queue",
        expect.stringContaining('"operation":"INSERT"')
      );
    });

    it("should handle existing sync queue", async () => {
      const existingQueue = [
        {
          id: "existing-id",
          table_name: "movements",
          operation: "UPDATE",
          data: { id: "existing", name: "Existing" },
          timestamp: "2024-01-01T00:00:00Z",
          retry_count: 0,
        },
      ];

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(existingQueue));
      mockLocalStorage.setItem.mockImplementation(() => {});

      const testData = { id: "test-id", name: "Test" };
      await HybridStorageManager.queueForSync("INSERT", "workouts", testData);

      const setItemCall = mockLocalStorage.setItem.mock.calls.find(
        (call) => call[0] === "fitness_app_sync_queue"
      );

      expect(setItemCall).toBeDefined();
      const queueData = JSON.parse(setItemCall![1]);
      expect(queueData).toHaveLength(2);
      expect(queueData[0]).toEqual(existingQueue[0]);
      expect(queueData[1].table_name).toBe("workouts");
    });
  });

  describe("Sync Status Management", () => {
    it("should return sync status with pending operations count", async () => {
      const mockQueue = [
        {
          id: "1",
          table_name: "workouts",
          operation: "INSERT",
          data: {},
          timestamp: "2024-01-01T00:00:00Z",
          retry_count: 0,
        },
        {
          id: "2",
          table_name: "sets",
          operation: "UPDATE",
          data: {},
          timestamp: "2024-01-01T00:00:00Z",
          retry_count: 1,
        },
      ];

      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === "fitness_app_sync_queue") return JSON.stringify(mockQueue);
        if (key === "fitness_app_last_sync") return "2024-01-01T00:00:00Z";
        if (key === "fitness_app_failed_operations") return "[]";
        return null;
      });

      const status = await HybridStorageManager.getSyncStatus();

      expect(status.pendingOperations).toBe(2);
      expect(status.lastSyncTime).toBe("2024-01-01T00:00:00Z");
      expect(status.isOnline).toBe(true); // Default in test environment
    });

    it("should handle missing sync data gracefully", async () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      const status = await HybridStorageManager.getSyncStatus();

      expect(status.pendingOperations).toBe(0);
      expect(status.lastSyncTime).toBeNull();
    });
  });

  describe("Data Filtering", () => {
    it("should filter local records by user_id", async () => {
      const mockData = [
        { id: "1", name: "Workout 1", user_id: "user-123" },
        { id: "2", name: "Workout 2", user_id: "user-456" },
        { id: "3", name: "Workout 3", user_id: "user-123" },
      ];

      // Mock localStorage to return our test data
      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key.startsWith("fitness_app_workouts_")) {
          const id = key.split("_").pop();
          const item = mockData.find((d) => d.id === id);
          return item ? JSON.stringify(item) : null;
        }
        return null;
      });

      // Mock Object.keys to return our test keys
      const originalKeys = Object.keys;
      Object.keys = jest
        .fn()
        .mockReturnValue([
          "fitness_app_workouts_1",
          "fitness_app_workouts_2",
          "fitness_app_workouts_3",
          "other_key",
        ]);

      const results = await HybridStorageManager.getLocalRecords("workouts", {
        user_id: "user-123",
      });

      expect(results).toHaveLength(2);
      expect(
        (results as Array<{ user_id: string }>).every(
          (r) => r.user_id === "user-123"
        )
      ).toBe(true);

      // Restore original Object.keys
      Object.keys = originalKeys;
    });
  });

  describe("Error Handling", () => {
    it("should handle localStorage quota exceeded", async () => {
      const testData = { id: "test-id", name: "Test" };

      mockLocalStorage.setItem.mockImplementation(() => {
        throw new DOMException("QuotaExceededError");
      });

      // Should not throw, but queue for sync instead
      const result = await HybridStorageManager.saveRecord(
        "workouts",
        testData
      );
      expect(result).toEqual(testData);
    });
  });

  describe("Background Sync", () => {
    it("should process sync queue operations", async () => {
      const mockQueue = [
        {
          id: "test-id",
          table_name: "workouts",
          operation: "INSERT" as const,
          data: { id: "test", name: "Test" },
          timestamp: "2024-01-01T00:00:00Z",
          retry_count: 0,
        },
      ];

      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === "fitness_app_sync_queue") return JSON.stringify(mockQueue);
        return null;
      });
      mockLocalStorage.setItem.mockImplementation(() => {});

      await HybridStorageManager.processBackgroundSync();

      // Verify that localStorage operations were called
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith(
        "fitness_app_sync_queue"
      );
    });

    it("should update last sync time after successful sync", async () => {
      mockLocalStorage.getItem.mockReturnValue("[]"); // Empty queue
      mockLocalStorage.setItem.mockImplementation(() => {});

      await HybridStorageManager.processBackgroundSync();

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        "fitness_app_last_sync",
        expect.any(String)
      );
    });
  });

  describe("Manual Sync Trigger", () => {
    it("should trigger manual sync and return status", async () => {
      mockLocalStorage.getItem.mockReturnValue("[]");
      mockLocalStorage.setItem.mockImplementation(() => {});

      const result = await HybridStorageManager.triggerManualSync();

      expect(result.success).toBe(true);
      expect(result.syncedOperations).toBe(0);
    });
  });

  describe("Failed Operations Management", () => {
    it("should track failed operations", async () => {
      mockLocalStorage.getItem.mockReturnValue("[]");

      const failedOps = await HybridStorageManager.getFailedOperations();

      expect(Array.isArray(failedOps)).toBe(true);
    });

    it("should clear failed operations", async () => {
      mockLocalStorage.getItem.mockReturnValue("[]");
      mockLocalStorage.setItem.mockImplementation(() => {});

      await HybridStorageManager.clearFailedOperations();

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        "fitness_app_sync_queue",
        "[]"
      );
    });
  });

  describe("Offline Functionality", () => {
    it("should queue operations when offline", async () => {
      mockNavigator.onLine = false;

      const testData = { id: "test-id", name: "Test" };
      mockLocalStorage.getItem.mockReturnValue("[]");
      mockLocalStorage.setItem.mockImplementation(() => {});

      const result = await HybridStorageManager.saveRecord(
        "workouts",
        testData
      );

      expect(result).toEqual(testData);
      // Should queue for sync when offline
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        "fitness_app_sync_queue",
        expect.stringContaining('"operation":"INSERT"')
      );
    });

    it("should not process sync when offline", async () => {
      mockNavigator.onLine = false;

      await HybridStorageManager.processBackgroundSync();

      // Should return early and not attempt sync operations
      expect(mockLocalStorage.getItem).not.toHaveBeenCalled();
    });
  });
});
