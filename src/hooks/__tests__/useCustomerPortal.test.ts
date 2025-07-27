import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCustomerPortal } from '../useCustomerPortal';

// Mock fetch globally - this will override any MSW interceptors
const mockFetch = vi.fn();

// Override global fetch before each test
beforeEach(() => {
  global.fetch = mockFetch;
});

// Mock window.location
const mockLocationAssign = vi.fn();
Object.defineProperty(window, 'location', {
  value: {
    href: '',
    assign: mockLocationAssign
  },
  writable: true
});

describe('useCustomerPortal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset window.location.href before each test
    window.location.href = '';
  });

  it('should initialize with correct default state', () => {
    const { result } = renderHook(() => useCustomerPortal());

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(typeof result.current.redirectToPortal).toBe('function');
  });

  it('should handle successful portal redirect', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ url: 'https://billing.stripe.com/portal-session' })
    });

    const { result } = renderHook(() => useCustomerPortal());

    await act(async () => {
      await result.current.redirectToPortal();
    });

    expect(mockFetch).toHaveBeenCalledWith('/api/stripe/create-portal-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    expect(window.location.href).toBe('https://billing.stripe.com/portal-session');
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('should handle API errors correctly', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: 'No active subscription found' })
    });

    const { result } = renderHook(() => useCustomerPortal());

    await act(async () => {
      await result.current.redirectToPortal();
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe('No active subscription found');
    // Location should remain unchanged since redirect only happens on success
    expect(window.location.href).toBe(''); // Should not redirect on error
  });

  it('should handle network errors', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useCustomerPortal());

    await act(async () => {
      await result.current.redirectToPortal();
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe('Network error');
  });

  it('should set loading state during API call', async () => {
    let resolvePromise: (value: Response) => void;
    const promise = new Promise((resolve) => {
      resolvePromise = resolve;
    });

    mockFetch.mockReturnValue(promise);

    const { result } = renderHook(() => useCustomerPortal());

    act(() => {
      result.current.redirectToPortal();
    });

    // Should be loading immediately after call
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBe(null);

    // Resolve the promise
    await act(async () => {
      resolvePromise!({
        ok: true,
        json: () => Promise.resolve({ url: 'https://test.com' })
      });
      await promise;
    });

    expect(result.current.loading).toBe(false);
  });

  it('should prevent race conditions when called multiple times', async () => {
    let resolveFirstCall: (value: Response) => void;
    const firstCallPromise = new Promise((resolve) => {
      resolveFirstCall = resolve;
    });

    // Mock fetch to return a promise that we control
    mockFetch.mockReturnValue(firstCallPromise);

    const { result } = renderHook(() => useCustomerPortal());

    // Start the first call
    const firstCall = result.current.redirectToPortal();
    
    // Immediately try to start more calls while first is still loading
    // These should be ignored due to race condition protection
    const secondCall = result.current.redirectToPortal();
    const thirdCall = result.current.redirectToPortal();

    // Resolve the mock fetch
    await act(async () => {
      resolveFirstCall!({
        ok: true,
        json: () => Promise.resolve({ url: 'https://test.com' })
      });
      
      // Wait for all promises to complete
      await Promise.all([firstCall, secondCall, thirdCall]);
    });

    // Should only make one API call due to race condition protection
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('should clear error state on successful call after previous error', async () => {
    const { result } = renderHook(() => useCustomerPortal());

    // First call fails
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ error: 'API Error' })
    });

    await act(async () => {
      await result.current.redirectToPortal();
    });

    expect(result.current.error).toBe('API Error');

    // Second call succeeds
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ url: 'https://success.com' })
    });

    await act(async () => {
      await result.current.redirectToPortal();
    });

    expect(result.current.error).toBe(null);
    expect(result.current.loading).toBe(false);
  });

  it('should handle malformed API response', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({}) // No error field
    });

    const { result } = renderHook(() => useCustomerPortal());

    await act(async () => {
      await result.current.redirectToPortal();
    });

    expect(result.current.error).toBe('Failed to create portal session');
  });
});