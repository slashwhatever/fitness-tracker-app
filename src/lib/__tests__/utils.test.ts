import { describe, it, expect } from 'vitest';
import { cn } from '../utils';

describe('utils', () => {
  describe('cn', () => {
    it('should combine multiple class names', () => {
      const result = cn('flex', 'items-center', 'justify-center');
      expect(result).toBe('flex items-center justify-center');
    });

    it('should handle conditional classes', () => {
      const result = cn('base-class', true && 'active-class', false && 'inactive-class');
      expect(result).toBe('base-class active-class');
    });

    it('should merge conflicting Tailwind classes', () => {
      // twMerge should prioritize the last conflicting class
      const result = cn('px-4', 'px-8');
      expect(result).toBe('px-8');
    });

    it('should handle arrays of classes', () => {
      const result = cn(['flex', 'items-center'], 'justify-center');
      expect(result).toBe('flex items-center justify-center');
    });

    it('should handle objects with conditional classes', () => {
      const result = cn({
        'bg-blue-500': true,
        'text-white': true,
        'hidden': false
      });
      expect(result).toBe('bg-blue-500 text-white');
    });

    it('should handle empty or null inputs', () => {
      const result = cn('', null, undefined, false, 'valid-class');
      expect(result).toBe('valid-class');
    });

    it('should handle no inputs', () => {
      const result = cn();
      expect(result).toBe('');
    });

    it('should combine complex scenario with conflicting classes', () => {
      const isActive = true;
      const size = 'large';
      
      const result = cn(
        'button',
        'px-4 py-2', // base padding
        isActive && 'bg-blue-500 text-white',
        size === 'large' && 'px-6 py-3', // overrides base padding
        {
          'hover:bg-blue-600': isActive,
          'disabled:opacity-50': false
        }
      );
      
      expect(result).toBe('button bg-blue-500 text-white px-6 py-3 hover:bg-blue-600');
    });

    it('should handle Tailwind responsive and state variants', () => {
      const result = cn(
        'text-sm md:text-base',
        'hover:bg-gray-100 focus:bg-gray-200'
      );
      expect(result).toBe('text-sm md:text-base hover:bg-gray-100 focus:bg-gray-200');
    });

    it('should handle duplicate classes', () => {
      const result = cn('flex', 'flex', 'items-center');
      expect(result).toBe('flex items-center');
    });

    it('should handle mixed input types', () => {
      const result = cn(
        'base',
        ['array-class-1', 'array-class-2'],
        {
          'object-class-1': true,
          'object-class-2': false
        },
        'string-class',
        null,
        undefined,
        false && 'conditional-class'
      );
      expect(result).toBe('base array-class-1 array-class-2 object-class-1 string-class');
    });
  });
});