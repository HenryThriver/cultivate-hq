import { describe, it, expect } from 'vitest';
import {
  isFeatureFlagRow,
  isFeatureFlagWithUserOverride,
  extractUserOverride,
  type FeatureFlagRow,
  type FeatureFlagWithUserOverride,
} from '../feature-flags';

describe('Type Guards', () => {
  describe('isFeatureFlagRow', () => {
    it('should return true for valid FeatureFlagRow', () => {
      const validFlag: FeatureFlagRow = {
        id: 'test-id',
        name: 'test-flag',
        description: 'Test description',
        enabled_globally: true,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
      };

      expect(isFeatureFlagRow(validFlag)).toBe(true);
    });

    it('should return true for valid FeatureFlagRow with null description', () => {
      const validFlag: FeatureFlagRow = {
        id: 'test-id',
        name: 'test-flag',
        description: null,
        enabled_globally: false,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
      };

      expect(isFeatureFlagRow(validFlag)).toBe(true);
    });

    it('should return false for null', () => {
      expect(isFeatureFlagRow(null)).toBe(false);
    });

    it('should return false for undefined', () => {
      expect(isFeatureFlagRow(undefined)).toBe(false);
    });

    it('should return false for non-object', () => {
      expect(isFeatureFlagRow('string')).toBe(false);
      expect(isFeatureFlagRow(123)).toBe(false);
      expect(isFeatureFlagRow([])).toBe(false);
    });

    it('should return false for object missing required fields', () => {
      expect(isFeatureFlagRow({})).toBe(false);
      expect(isFeatureFlagRow({ id: 'test' })).toBe(false);
      expect(isFeatureFlagRow({ 
        id: 'test', 
        name: 'flag' 
      })).toBe(false);
    });

    it('should return false for object with wrong field types', () => {
      expect(isFeatureFlagRow({
        id: 123, // should be string
        name: 'test-flag',
        description: 'Test description',
        enabled_globally: true,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
      })).toBe(false);

      expect(isFeatureFlagRow({
        id: 'test-id',
        name: 'test-flag',
        description: 'Test description',
        enabled_globally: 'true', // should be boolean
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
      })).toBe(false);
    });
  });

  describe('isFeatureFlagWithUserOverride', () => {
    it('should return true for valid FeatureFlagWithUserOverride', () => {
      const validFlag: FeatureFlagWithUserOverride = {
        id: 'test-id',
        name: 'test-flag',
        description: 'Test description',
        enabled_globally: true,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
        user_feature_overrides: [{ enabled: false }],
      };

      expect(isFeatureFlagWithUserOverride(validFlag)).toBe(true);
    });

    it('should return true for valid flag with empty overrides array', () => {
      const validFlag: FeatureFlagWithUserOverride = {
        id: 'test-id',
        name: 'test-flag',
        description: null,
        enabled_globally: false,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
        user_feature_overrides: [],
      };

      expect(isFeatureFlagWithUserOverride(validFlag)).toBe(true);
    });

    it('should return false for flag without user_feature_overrides', () => {
      const invalidFlag = {
        id: 'test-id',
        name: 'test-flag',
        description: 'Test description',
        enabled_globally: true,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
        // missing user_feature_overrides
      };

      expect(isFeatureFlagWithUserOverride(invalidFlag)).toBe(false);
    });

    it('should return false for flag with non-array user_feature_overrides', () => {
      const invalidFlag = {
        id: 'test-id',
        name: 'test-flag',
        description: 'Test description',
        enabled_globally: true,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
        user_feature_overrides: 'invalid', // should be array
      };

      expect(isFeatureFlagWithUserOverride(invalidFlag)).toBe(false);
    });

    it('should return false for invalid base FeatureFlagRow', () => {
      const invalidFlag = {
        id: 123, // should be string
        name: 'test-flag',
        user_feature_overrides: [],
      };

      expect(isFeatureFlagWithUserOverride(invalidFlag)).toBe(false);
    });
  });

  describe('extractUserOverride', () => {
    it('should return override data for valid array', () => {
      const overrides = [{ enabled: true }];
      const result = extractUserOverride(overrides);
      
      expect(result).toEqual({ enabled: true });
    });

    it('should return first override when multiple exist', () => {
      const overrides = [
        { enabled: true },
        { enabled: false },
      ];
      const result = extractUserOverride(overrides);
      
      expect(result).toEqual({ enabled: true });
    });

    it('should return null for empty array', () => {
      const result = extractUserOverride([]);
      expect(result).toBe(null);
    });

    it('should return null for non-array input', () => {
      expect(extractUserOverride('invalid')).toBe(null);
      expect(extractUserOverride(null)).toBe(null);
      expect(extractUserOverride(undefined)).toBe(null);
      expect(extractUserOverride({})).toBe(null);
    });

    it('should return null for array with invalid override objects', () => {
      expect(extractUserOverride([{}])).toBe(null);
      expect(extractUserOverride([{ enabled: 'true' }])).toBe(null); // should be boolean
      expect(extractUserOverride([{ disabled: false }])).toBe(null); // wrong property name
      expect(extractUserOverride([null])).toBe(null);
    });

    it('should handle mixed valid and invalid objects', () => {
      const overrides = [
        null, // invalid
        { enabled: 'true' }, // invalid type
        { enabled: false }, // valid - should be returned
      ];
      
      // Should return null because first valid object is at index 2, but function returns first array element
      const result = extractUserOverride(overrides);
      expect(result).toBe(null);
    });
  });
});