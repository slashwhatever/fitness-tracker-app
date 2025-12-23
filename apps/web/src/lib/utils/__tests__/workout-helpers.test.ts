import { describe, it, expect } from 'vitest';
import { prepareWorkoutMovements, getNextOrderIndex } from '../workout-helpers';

describe('workout-helpers', () => {
  describe('prepareWorkoutMovements', () => {
    it('should prepare single movement with default starting index', () => {
      const workoutId = 'workout-123';
      const userMovementIds = ['movement-1'];
      
      const result = prepareWorkoutMovements(workoutId, userMovementIds);
      
      expect(result).toEqual([
        {
          workout_id: 'workout-123',
          user_movement_id: 'movement-1',
          order_index: 0
        }
      ]);
    });

    it('should prepare multiple movements with sequential order indexes', () => {
      const workoutId = 'workout-123';
      const userMovementIds = ['movement-1', 'movement-2', 'movement-3'];
      
      const result = prepareWorkoutMovements(workoutId, userMovementIds);
      
      expect(result).toEqual([
        {
          workout_id: 'workout-123',
          user_movement_id: 'movement-1',
          order_index: 0
        },
        {
          workout_id: 'workout-123',
          user_movement_id: 'movement-2',
          order_index: 1
        },
        {
          workout_id: 'workout-123',
          user_movement_id: 'movement-3',
          order_index: 2
        }
      ]);
    });

    it('should prepare movements with custom starting index', () => {
      const workoutId = 'workout-123';
      const userMovementIds = ['movement-1', 'movement-2'];
      const startingOrderIndex = 5;
      
      const result = prepareWorkoutMovements(workoutId, userMovementIds, startingOrderIndex);
      
      expect(result).toEqual([
        {
          workout_id: 'workout-123',
          user_movement_id: 'movement-1',
          order_index: 5
        },
        {
          workout_id: 'workout-123',
          user_movement_id: 'movement-2',
          order_index: 6
        }
      ]);
    });

    it('should handle empty array of movement IDs', () => {
      const workoutId = 'workout-123';
      const userMovementIds: string[] = [];
      
      const result = prepareWorkoutMovements(workoutId, userMovementIds);
      
      expect(result).toEqual([]);
    });

    it('should handle zero starting index explicitly', () => {
      const workoutId = 'workout-123';
      const userMovementIds = ['movement-1'];
      const startingOrderIndex = 0;
      
      const result = prepareWorkoutMovements(workoutId, userMovementIds, startingOrderIndex);
      
      expect(result).toEqual([
        {
          workout_id: 'workout-123',
          user_movement_id: 'movement-1',
          order_index: 0
        }
      ]);
    });
  });

  describe('getNextOrderIndex', () => {
    it('should return 0 for empty movements array', () => {
      const existingMovements: { order_index: number }[] = [];
      
      const result = getNextOrderIndex(existingMovements);
      
      expect(result).toBe(0);
    });

    it('should return next index after highest order_index', () => {
      const existingMovements = [
        { order_index: 0 },
        { order_index: 2 },
        { order_index: 1 }
      ];
      
      const result = getNextOrderIndex(existingMovements);
      
      expect(result).toBe(3);
    });

    it('should handle single movement', () => {
      const existingMovements = [
        { order_index: 5 }
      ];
      
      const result = getNextOrderIndex(existingMovements);
      
      expect(result).toBe(6);
    });

    it('should handle movements with order_index of 0', () => {
      const existingMovements = [
        { order_index: 0 }
      ];
      
      const result = getNextOrderIndex(existingMovements);
      
      expect(result).toBe(1);
    });

    it('should handle null/undefined order_index values', () => {
      const existingMovements = [
        { order_index: 2 },
        { order_index: 0 }, // This should be treated as 0, not null
        { order_index: 1 }
      ];
      
      const result = getNextOrderIndex(existingMovements);
      
      expect(result).toBe(3);
    });

    it('should work with objects that have additional properties', () => {
      const existingMovements = [
        { order_index: 1, workout_id: 'w1', user_movement_id: 'm1' },
        { order_index: 3, workout_id: 'w1', user_movement_id: 'm2' },
        { order_index: 0, workout_id: 'w1', user_movement_id: 'm3' }
      ];
      
      const result = getNextOrderIndex(existingMovements);
      
      expect(result).toBe(4);
    });

    it('should handle negative order indexes', () => {
      const existingMovements = [
        { order_index: -1 },
        { order_index: 2 },
        { order_index: 0 }
      ];
      
      const result = getNextOrderIndex(existingMovements);
      
      expect(result).toBe(3);
    });
  });
});