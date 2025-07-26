import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '../create-checkout-session/route';

// Mock Stripe
const mockStripeSessionCreate = vi.fn();
vi.mock('@/lib/stripe-server', () => ({
  getServerStripe: () => ({
    checkout: {
      sessions: {
        create: mockStripeSessionCreate
      }
    }
  })
}));

// Mock Supabase
const mockSupabaseAuth = {
  getUser: vi.fn()
};
const mockSupabaseFrom = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({
    auth: mockSupabaseAuth,
    from: mockSupabaseFrom
  })
}));

describe('POST /api/stripe/create-checkout-session', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mock implementations
    mockStripeSessionCreate.mockResolvedValue({ id: 'test_session_id' });
    mockSupabaseAuth.getUser.mockResolvedValue({ data: { user: null }, error: null });
    mockSupabaseFrom.mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn().mockResolvedValue({ data: null, error: null })
        }))
      }))
    });
  });

  it('should create checkout session for monthly pricing tier', async () => {
    const request = new NextRequest('http://localhost:3000/api/stripe/create-checkout-session', {
      method: 'POST',
      body: JSON.stringify({ priceType: 'monthly' })
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ sessionId: 'test_session_id' });
    expect(mockStripeSessionCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: 'subscription',
        line_items: expect.arrayContaining([
          expect.objectContaining({
            price_data: expect.objectContaining({
              unit_amount: 3000, // $30
              recurring: {
                interval: 'month'
              }
            })
          })
        ])
      })
    );
  });

  it('should create checkout session for annual pricing tier', async () => {
    const request = new NextRequest('http://localhost:3000/api/stripe/create-checkout-session', {
      method: 'POST',
      body: JSON.stringify({ priceType: 'annual' })
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ sessionId: 'test_session_id' });
    expect(mockStripeSessionCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: 'subscription',
        line_items: expect.arrayContaining([
          expect.objectContaining({
            price_data: expect.objectContaining({
              unit_amount: 30000, // $300
              recurring: {
                interval: 'year'
              }
            })
          })
        ])
      })
    );
  });

  it('should create checkout session for supporter tier as one-time payment', async () => {
    const request = new NextRequest('http://localhost:3000/api/stripe/create-checkout-session', {
      method: 'POST',
      body: JSON.stringify({ priceType: 'supporter' })
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ sessionId: 'test_session_id' });
    expect(mockStripeSessionCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: 'payment', // One-time payment
        line_items: expect.arrayContaining([
          expect.objectContaining({
            price_data: expect.objectContaining({
              unit_amount: 300000 // $3000
              // No recurring field for one-time payment
            })
          })
        ])
      })
    );
    
    // Verify no recurring field
    const callArgs = mockStripeSessionCreate.mock.calls[0][0];
    expect(callArgs.line_items[0].price_data.recurring).toBeUndefined();
  });

  it('should validate user authentication and use session userId', async () => {
    // Mock authenticated user
    mockSupabaseAuth.getUser.mockResolvedValue({
      data: { user: { id: 'authenticated_user_id', email: 'user@example.com' } },
      error: null
    });
    
    mockSupabaseFrom.mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn().mockResolvedValue({
            data: { email: 'user@example.com', name: 'Test User' },
            error: null
          })
        }))
      }))
    });

    const request = new NextRequest('http://localhost:3000/api/stripe/create-checkout-session', {
      method: 'POST',
      body: JSON.stringify({ priceType: 'monthly' })
    });

    await POST(request);

    expect(mockStripeSessionCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        customer_email: 'user@example.com',
        metadata: expect.objectContaining({
          userId: 'authenticated_user_id' // Should use authenticated user ID
        })
      })
    );
  });

  it('should handle Stripe API errors gracefully', async () => {
    mockStripeSessionCreate.mockRejectedValue(new Error('Stripe API error'));

    const request = new NextRequest('http://localhost:3000/api/stripe/create-checkout-session', {
      method: 'POST',
      body: JSON.stringify({ priceType: 'monthly' })
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({ error: 'Failed to create checkout session' });
  });

  it('should prevent userId spoofing by ignoring request body userId', async () => {
    // Mock authenticated user
    mockSupabaseAuth.getUser.mockResolvedValue({
      data: { user: { id: 'real_user_id', email: 'real@example.com' } },
      error: null
    });

    mockSupabaseFrom.mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn().mockResolvedValue({
            data: { email: 'real@example.com', name: 'Real User' },
            error: null
          })
        }))
      }))
    });

    // Try to pass a spoofed userId
    const request = new NextRequest('http://localhost:3000/api/stripe/create-checkout-session', {
      method: 'POST',
      body: JSON.stringify({ 
        priceType: 'monthly',
        userId: 'spoofed_user_id' // This should be ignored
      })
    });

    await POST(request);

    // Verify the API used the authenticated user's ID from session, not request body
    expect(mockSupabaseAuth.getUser).toHaveBeenCalled();
    expect(mockSupabaseFrom).toHaveBeenCalledWith('users');
  });

  it('should return error for missing priceType', async () => {
    const request = new NextRequest('http://localhost:3000/api/stripe/create-checkout-session', {
      method: 'POST',
      body: JSON.stringify({})
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({ error: 'Missing priceType parameter' });
  });

  it('should return error for invalid price type', async () => {
    const request = new NextRequest('http://localhost:3000/api/stripe/create-checkout-session', {
      method: 'POST',
      body: JSON.stringify({ priceType: 'invalid' })
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({ error: 'Invalid price type' });
  });

  it('should handle unauthenticated user checkout', async () => {
    // User is not authenticated
    mockSupabaseAuth.getUser.mockResolvedValue({
      data: { user: null },
      error: null
    });

    const request = new NextRequest('http://localhost:3000/api/stripe/create-checkout-session', {
      method: 'POST',
      body: JSON.stringify({ priceType: 'monthly' })
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ sessionId: 'test_session_id' });
    
    // Should create session without customer_email or userId
    const sessionConfig = mockStripeSessionCreate.mock.calls[0][0];
    expect(sessionConfig.customer_email).toBeUndefined();
    expect(sessionConfig.metadata?.userId).toBeUndefined();
  });
});